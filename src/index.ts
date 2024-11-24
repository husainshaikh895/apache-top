import _, { uniq } from 'lodash';
import { setTimeout } from 'node:timers/promises';
import fs from 'node:fs/promises';
import { parseData } from "./utils";

const logSourceFilePath = 'log-generator/access.log';

const main = async () => {
  while (true) {
    console.clear();
    try {
      const data = await fs.readFile(logSourceFilePath, { encoding: 'utf8' });
      const logFileSize = (await fs.stat(logSourceFilePath)).size;

      // step 1: Parse the file
      const data_array: String[] = data.split('\n', );

      // parse the data
      const parsed_data = parseData(data_array);
      
      // print statistics from parsed data
      console.log("** APACHE TOP - OVERALL ANALYZED REQUESTS **\n");

      console.log("Total Requests: " + parsed_data.totalRequests + "\tUnique Visitors: "+ parsed_data.uniqueVisitorsCount + "\tReferers: "+ parsed_data.referersCount + "\tLog Source: " + logSourceFilePath);
      console.log("Valid Requests: " + (parsed_data.totalRequests - parsed_data.invalidRequestsLength) + "\tLog Size: " + logFileSize/1000 + " KiB")
      console.log("Failed Requests: "+ parsed_data.failedRequestsCount)

      // print Unique Visitors Per day
      console.log("\n\n** 1. Unique Visitors Per Day **\n")
      for (var [key, value] of parsed_data.uniqueVisitorsPerDay){
        console.log(value.uniqueIps.size + "\t" + value.responseSize/1000 + " KiB\t" + key);
      }
      
      // print Files requested by users
      console.log("\n\n** 2. Requested Files **\n")
      for (var [keyName, countSize] of parsed_data.fileAccessData){
        const fileData = keyName.split("_");
        const fileName = fileData[0];
        const httpType = fileData[1];
        const httpVersion = fileData[2]; 
        console.log(countSize.count + "\t" + countSize.responseSize/1000 + " KiB" + "\t"+ httpType + "\t" + httpVersion + "\t" + fileName);
      }

      console.log("\n\n** 3. 404 Requested Files **\n")
      for (var [keyName, countSize] of parsed_data._404RequestedFilesMap){
        const fileData = keyName.split("_");
        const fileName = fileData[0];
        const httpType = fileData[1];
        const httpVersion = fileData[2]; 
        console.log(countSize.count + "\t" + countSize.responseSize/1000 + " KiB" + "\t"+ httpType + "\t" + httpVersion + "\t" + fileName);
      }

    } catch (err) {
      console.log(err);
    }
    await setTimeout(500);
  }
};

main();