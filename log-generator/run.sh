echo "" > access.log
while true; do  sleep 0.5; python ./log-generator.py >> access.log; done