### Apache Top
apache-top is a command-line utility that provides real-time monitoring and statistics for an Apache HTTP server. It is similar in concept to the top command, but it specifically focuses on monitoring Apache web server activity.

![apache-top](top.gif)

### access.log

```
202.12.220.133 - - [07/Oct/2023:04:28:49 +0000] "PUT /list HTTP/1.0" 404 5052 "https://wallace.com/category/list/main/terms/" "Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X; ca-ES) AppleWebKit/532.47.3 (KHTML, like Gecko) Version/3.0.5 Mobile/8B113 Safari/6532.47.3"
```
1. IP Address: 202.12.220.133

2. Remote User: -

3. Authenticated User: -

4. Timestamp: [07/Oct/2023:04:28:49 +0000]

5. HTTP Request: "PUT /list HTTP/1.0"

6. HTTP Status Code: 404

7. Response Size: 5052 bytes

8. Referer: "https://wallace.com/category/list/main/terms/"

9. User-Agent: "Mozilla/5.0 (iPod; U; CPU iPhone OS 3_0 like Mac OS X; ca-ES) AppleWebKit/532.47.3 (KHTML, like Gecko) Version/3.0.5 Mobile/8B113 Safari/6532.47.3"



### Using log-generator
```bash
# Run and test with log-generator
docker compose -f ./log-generator/docker-compose.yml up
# Stop log-generator
docker compose -f ./log-generator/docker-compose.yml down
```

### Tasks
- AAD, I have apache-top parser
- AAD, I have apache-top printer
  - AAD, I have apache-top printer: Overall Analysed Requests
  - AAD, I have apache-top printer: Unique Visitors per Day
  - AAD, I have apache-top printer: Requested Files
  - AAD, I have apache-top printer: 404 Requested Files
- AAD, I have apache-top test units

### Limitation
- Do NOT use syntax ```let```
- Do NOT use new packages outside what are listed in packages.json
