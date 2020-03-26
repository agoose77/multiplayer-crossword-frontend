# guardian-crossword-multiplayer
A stupid implementation of multiplayer for the Guardian react-crossword.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Production
This project uses NGINX to unify the backend endpoint under the same endpoint as the static files using a reverse-proxy. This is used to facilitate the `proxy` feature during development.

Use `npm run start` / `$PWD/production/launch-production.sh`, or perform the following steps:
1. `cd` to the git root directory
1. Build the package using `npm build`
1. Start the backend on `localhost:5000` using `npm run start-backend` (or `python3 $PWD/backend/crossword.py`)
1. Run NGINX to unify the backend under the static endpoint 
  `sudo docker run --rm --name crossword -v $PWD/production/nginx:/etc/nginx:ro -v $PWD/build:/usr/share/nginx/html --network=host -nginx`
1. Connect to `localhost:8000`
1. [Optional] One can use `ngrok` to expose the server to an external URL, with `ngrok start -config=.$PWD/production/ngrok.conf`. 


## Development
In development mode, do not use nginx. The backend is proxied by `src/setupProxy.js`

1. `cd` to the git root directory
1. Start the backend on `localhost:5000` using `npm run start-backend` (or `python3 ./backend/crossword.py`)
1. Start the frontend with `npm start`

## Available Scripts

In the project directory, you can run:

### `npm start`

Launches the backend, NGINX, and starts ngrok session. 

### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run start-dev-frontend`

Runs the frontend in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run start-backend`

Run the backend python server.  

Open [http://localhost:5000](http://localhost:5000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
