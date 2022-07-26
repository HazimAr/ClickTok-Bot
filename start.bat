@echo off
echo Starting..
:main
ts-node ./src/bot.ts
echo Restarting Bot..
goto main