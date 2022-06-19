import { Button } from "@mui/material";
import { useSnackbar } from "notistack";
import React, { useEffect } from "react";
import { useRecoilValue } from "recoil";
import firebase from "../../firebase/firebase-config";
import { RoomDataState, UserData } from "../../PokerStateManagement/Atom";


function AlertUserEvent() {
  const userData = useRecoilValue(UserData);
  const roomData = useRecoilValue(RoomDataState);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  function Notification(type: any, message: string) {
    enqueueSnackbar(message, {
      variant: type,
      autoHideDuration: 10000,
      action: (key) => (
        <Button
          size="small"
          style={{ color: "white" }}
          onClick={() => closeSnackbar(key)}
        >
          Dismiss
        </Button>
      ),
    });
  }
  useEffect(() => {
    firebase
      .database()
      .ref(`poker/alert_user_event/${roomData.roomId}/success`)
      .on("value", (snapshot) => {
        if (snapshot.val() !== null) {
          let message = snapshot.val().message as string;
          if (message !== "-") {
            Notification("success", message);
            firebase
              .database()
              .ref(`poker/alert_user_event/${roomData.roomId}/success`)
              .update({
                message: "-",
              });
          }
        }
      });

    firebase
      .database()
      .ref(`poker/alert_user_event/${roomData.roomId}/warning`)
      .on("value", (snapshot) => {
        if (snapshot.val() !== null) {
          let message = snapshot.val().message as string;
          if (message !== "-") {
            Notification("warning", message);
            firebase
              .database()
              .ref(`poker/alert_user_event/${roomData.roomId}/warning`)
              .update({
                message: "-",
              });
          }
        }
      });

    return () => {
      firebase
        .database()
        .ref(`poker/alert_user_event/${roomData.roomId}/success`)
        .off();
      firebase
        .database()
        .ref(`poker/alert_user_event/${roomData.roomId}/warning`)
        .off();
    };
  }, [userData, roomData]);

  return <></>;
}

export default AlertUserEvent;
