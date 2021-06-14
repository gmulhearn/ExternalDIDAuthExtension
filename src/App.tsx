import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Pairing } from './components/Pairing';
import { AppBar, Box, makeStyles, Toolbar, Typography } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  title: {
    flexGrow: 1,
  },
  menu: {
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(2),
  },
}));

const App = () => {

  const classes = useStyles();

  return (
    <Box className = {classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar>
          <Typography variant="h5" className={classes.title}>
            Pair a Device
          </Typography>
          <Box className={classes.menu}>
            
          </Box>
        </Toolbar>
      </AppBar>
      <Pairing />
    </Box>
  );
}

export default App;
