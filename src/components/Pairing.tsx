import React, { useEffect, useState } from "react";
import {
  Box,
    CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";
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

  const [qrVal, setQrVal] = useState<Number>(69);

  const pollNonce = async () => {
    setTimeout(() => {
      
    }, 1000);
  };

  useEffect(() => {
    pollNonce();
  });

  return (
    <Box display="flex" className={classes.root} alignItems="center" flexDirection="column">
      
          <div style={{margin: 20}} >
            <QRCode value={qrVal.toString()} size={350} />
          </div>
          <div>
              <CircularProgress size={80}/>
          </div>
        
    </Box>
  );
};
