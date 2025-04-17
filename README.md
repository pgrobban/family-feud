This is a version of Family Feud I created as an after work activity for my coworkers. The frontend part is based on NextJS, with a hand rolled server setup. Communication is handled over socket.io. Both frontend and server use TypeScript. UI uses Material UI 7 with a custom theme.

The idea is that two clients connect to the server. One is for the players to view the game board, and one is for the (technical) host to control the game. Ideally, there should be a game host (MC) to keep the flow more natural and true to the show.

There are 3 game modes:
* **Family warm up:** teams get one minute to discuss and write their top 3 answers on a paper. When the time is up, the host reveals the answers, then the team answers and points are awarded accordingly.
* **Face-off:** This is the first round of the real show. After the host reads the question, teams need to "buzz in" (by physical buzzers or shouting their team name). Whoever buzzes first gets to answer first.  
If the answer is the highest on the board, that team gets to choose if they want to play or pass the question to the other team. If the answer is not the highest (or not on the board), the opposing team gets a chance. Whoever had the highest will get to choose to play or pass the question to the other team.  
The team playing the question will be asked one by one for an answer, and they need to clear the board to win. An answer not on the board will result in a strike. If the family gets 3 strikes, the opposing team will get one chance to "steal" *any remaining* answer. Points will be awarded to the team that played for clearing the board, or the other team if they successfully stole.
* **Fast money** final round, also similar to the show. A member of the team in lead will get 5 questions to answer in 25 seconds. Only one answer per question is allowed, but the contestant can choose to pass the question and get the host to read it again later if time is left.  
The host reveals the answers and the total number of points. If the total is 150 or greater, the team is declared the final winner.  
If the contestant failed to reach 150 points, the opposing team gets one chance to answer any question. It needs to be the highest answer for that question. If they do it, they get the sum of the points on the board the first contestant answered + the steal points + 50 bonus points.  The host awards the points and can then choose to end the game and declare a final winner.

## Getting started
You will need NodeJS 22 or higher.

Additionally, you need to create a .env folder in the root of the project with the following variables:

```
NEXT_PUBLIC_SOCKET_IO_PORT=3002
SOCKET_IO_PORT=3002
```

(the reason they are duplicated is because the first one is public to NextJS, and not exposed to the server).

Optional: Add
```
CORS_ORIGIN=<your frontend ip>:<your frontend port>
```

to be able to connect to the server from outside the home network.

After these are done, simply run

```
npm install
npm run dev
```

This will start a dev instance of both the frontend and the server running with hot reloading on both.

## Coding 
Check out `/src/shared/types.ts` for information about the game modes and statuses. This should make following the logic (in `server/controller/Game.ts`) easier. 

Frontend components are in the routes `game` for the players' side and `host` 


## Build for production

Check the CORS rules in `src/server/server.ts`


```
npm run build
```

Then 
```
npm start
```

This will run the frontend on localhost:3000

```
npm run start:server
```

will run the server on the ports defined in the .env file.


## FAQ

### Why not use NextJS built in socket.io route? Why do you need a custom server?
I had problems getting this to work with user defined ports and CORS.

### Why the dependencies on ts-node and tsconfig-paths?
I wanted to move the server code inside the `src` folder to indicate that it is all part of the same app. But ts-node would only read from the top level.

### &lt;insert file name here&gt; is messy, you should refactor it.
PRs are welcome :) 

### The UI is shit/why use fixed widths etc.
PRs are welcome :) 