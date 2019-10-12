const express = require('express');

const PORT = process.env.PORT || 8000;

const app = express();

app.use(express.static(`${__dirname}/dist`));

app.listen(PORT, () => {
  console.log(`App is running on ${PORT}` );
})

// "start": "webpack-dev-server --mode production --open"