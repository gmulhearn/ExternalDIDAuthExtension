import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Pairing } from "./components/Pairing";
import {
  AppBar,
  Box,
  Button,
  makeStyles,
  Toolbar,
  Typography
} from "@material-ui/core";
import {Switch as MaterialSwitch} from "@material-ui/core";
import { Route, Switch } from "react-router-dom";

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

  const [connected, setConnected] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);

  try {
    chrome.runtime.sendMessage({ type: "getEnabled"}, ({enabled}) => {
      setEnabled(enabled);
    })
  } catch (e) {}

  try {
    chrome.runtime.sendMessage({ type: "getNonce" }, ({ connected }) => {
      if (connected) {
        setConnected(true);
      }
    });
  } catch (e) {}

  const renderConnectButton = () => {
    if (!connected) {
      return (
        <Button variant="contained" color="secondary">
          Connect
        </Button>
      );
    } else {
      return (
        <Button variant="contained" color="secondary">
          Connected
        </Button>
      );
    }
  };

  const renderMain = () => {
    if (enabled) {
      if (connected) {
      return (
        <Switch>
          <Route exact path="/">
            Home
          </Route>
        </Switch>
      );
    } else {
      return (
        <Pairing />
      )
    }
    } else {
      return (
        <div>
          Disconnected!
        </div>
      )
    }
    
  };

  const onSwitchClick = () => {
    if (enabled) {
      chrome.runtime.sendMessage({type: "disabledWebRTC"}, () => {});
      setEnabled(false);
    } else {
      // enabling...
      chrome.runtime.sendMessage({type: "enabledWebRTC"}, () => {});
      setEnabled(true);
    }
  }

  return (
    <Box className={classes.root}>
      <AppBar position="sticky" color="inherit">
        <Toolbar>

          <Box className={classes.menu}>
            {renderConnectButton()}
            <MaterialSwitch 
              checked={enabled}
              onChange={onSwitchClick}
            />
            </Box>
        </Toolbar>
      </AppBar>
      {renderMain()}
    </Box>
  );
};

export default App;
