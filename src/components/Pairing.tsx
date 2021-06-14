import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import QRCode from "qrcode.react";

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

declare global {
  interface Window {
    webAuthnContext: any;
  }
}

export const Pairing = () => {
  const classes = useStyles();

  const [qrVal, setQrVal] = useState<Number | undefined>(undefined);
  const [connected, setConnected] = useState<Boolean>(false);

  const pollNonce = async () => {
    chrome.runtime.sendMessage({ type: "getNonce" }, ({ connected, nonce }) => {
      if (connected) {
        setConnected(true);
      }
      if (nonce) {
        setQrVal(nonce);
      }
    });

    setTimeout(() => {
      pollNonce();
    }, 1000);
  };

  useEffect(() => {
    pollNonce();
  }, []);

  const renderQR = () => {
    if (connected) {
      return (
        <div style={{margin: 100}}>
          <Typography>Connected!</Typography>
        </div>
      );
    }
    if (qrVal) {
      return (
        <div style={{ margin: 20 }}>
          <QRCode value={qrVal.toString()} size={350} />
        </div>
      );
    } else {
      return (
        <div>
          <Typography>Loading...</Typography>
          <div>
            <CircularProgress size={80} />
          </div>
        </div>
      );
    }
  };

  return (
    <Box
      display="flex"
      className={classes.root}
      alignItems="center"
      flexDirection="column"
    >
      {renderQR()}
    </Box>
  );
};
