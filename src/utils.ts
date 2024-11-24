const regexPattern = /"([^"]+)"|\[[^\]]+\]|(\S+)/g
// the regex has 3 parts
// "([^"]+)" => This part matches the double quoted string, even if they have spaces in between
// \[[^\]]+\] => This matches the timestamp square brackets, it handles the space as well
// (\S+) => this will match the remaining non spaces
// Initially, I was trying to remove whatever we didn't need, that's why my thought process took me sort of in the wrong direction
// this approach matches what we need, which works better, I also did a hardcoded string which matched each part, it was way simpler but this is a more general approach, even if we get a new data column, we would be able to handle it with minimal changes instead of playing with regex again


export function parseData(data_array: String[]) {
    const totalRequests = data_array.length;
    var uniqueVistors = new Set<String>();
    var referers = new Array<String>();
    // segregated data of users across days
    const uniqueVisitorsPerDay = new Map<string, { uniqueIps: Set<string>; responseSize: number }>();
    const fileAccessMap = new Map<string, {count: number; responseSize: number;}>();
    // accumulate 4xx requests
    var invalidRequests = new Array<Object>();
    const _404RequestedFilesMap = new Map<string, {count: number; responseSize: number;}>();
    // accumulate 5xx requests
    var failedRequestsCount = 0;

    // loop over each line
    data_array.forEach((line) => {
      const parsedLine = parseLine(line);
      if (parsedLine) {
        // count unique ips for getting number of unique visitors
        uniqueVistors.add(parsedLine.ip);
        // save referers
        referers.push(parsedLine.referer);
        // count failed requests
        const statusCode = parsedLine.httpStatusCode
        if (statusCode && statusCode.startsWith("4")) {
          invalidRequests.push(parsedLine);
        }
        else if (statusCode && statusCode.startsWith("5")) {
          failedRequestsCount += 1;
        }

        // get response size
        const responseSize = parseInt(parsedLine.responseSize)

        // accumulate by files
        const httpRequest = parsedLine.httpRequest.replaceAll('"', "").split(" ");
        const httpType = httpRequest[0];
        const fileUrl = httpRequest[1];
        const httpVersion = httpRequest[2];

        const httpStatus = parsedLine.httpStatusCode;
        const keyName = fileUrl + "_" + httpType + "_" + httpVersion;

        // Check if key exists in fileAccessMap
        const entry = fileAccessMap.get(keyName);
        if (entry) {
            // Update existing entry in fileAccessMap
            entry.count += 1;
            entry.responseSize += responseSize;

            // Handle 404 status
            if (httpStatus === "404") {
                const _404entry = _404RequestedFilesMap.get(keyName);
                if (_404entry) {
                    _404entry.count += 1;
                    _404entry.responseSize += responseSize;
                } else {
                    _404RequestedFilesMap.set(keyName, { count: 1, responseSize: responseSize });
                }
            }
        } else {
            // Add new entry to fileAccessMap
            fileAccessMap.set(keyName, { count: 1, responseSize: responseSize });

            // Handle 404 status
            if (httpStatus === "404") {
                _404RequestedFilesMap.set(keyName, { count: 1, responseSize: responseSize });
            }
        }

        // accumulate unique visitors count each day and accumulate response size
        const parsedDate = getConvertedDate(parsedLine.timestamp);
        
        if (parsedDate){
          if (uniqueVisitorsPerDay.has(parsedDate)) {
            const entry = uniqueVisitorsPerDay.get(parsedDate);
            if (entry) {
                entry.uniqueIps.add(parsedLine.ip);
                entry.responseSize += responseSize;
            }
        }
        else {
          uniqueVisitorsPerDay.set(parsedDate, { uniqueIps: new Set<string>([parsedLine.ip]), responseSize: responseSize });
        }
      }
      }
    })

    return {
      totalRequests: totalRequests,
      uniqueVisitorsCount: uniqueVistors.size,
      referersCount: referers.length,
      invalidRequestsLength: invalidRequests.length,
      failedRequestsCount: failedRequestsCount,
      uniqueVisitorsPerDay: uniqueVisitorsPerDay,
      fileAccessData: fileAccessMap,
      _404RequestedFilesMap: _404RequestedFilesMap
    }
}

function getConvertedDate(timestamp: string) {
    // returns date in proper format from the timestamp
    const regexPattern = /(\d){2}\/(\w){3}\/\d{4}/;
    // a simple regex to match date\month\year, I've kept the format same for now 
    const parsedDate = timestamp.match(regexPattern);
    if (parsedDate){
      return parsedDate[0];
    }
    return null;
}

function parseLine(line: String) {
    // parser function for each line
    const extractedFields = line.match(regexPattern);
    if (extractedFields) {
      return {
        ip: extractedFields[0],  // IP address
        remoteUser: extractedFields[1], // remote user -> always -
        authenticatedUser: extractedFields[2], // authenticated user -> always -
        timestamp: extractedFields[3],  // timestamp
        httpRequest: extractedFields[4],  // http request
        httpStatusCode: extractedFields[5],  // http status code
        responseSize: extractedFields[6],  // response size
        referer: extractedFields[7],  // referer - domain - redirection info
        userAgent: extractedFields[8],  // user agent, browser info
      };
    }
    else{
      // ignore this case if regex doesn't matches
      return null;
    }

}