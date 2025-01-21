import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

import useCountdown from '../../hooks/useCountdown/useCountdown'
import { useAppState } from '../../state';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      marginLeft: '1em',
      fontSize: '1.3em',
    },
  })
);

export default function Countdown() {
  const { user } = useAppState();
  const [showAlert, setShowAlert] = React.useState(true);
  const timeLeft = useCountdown();
  const classes = useStyles();

  if (timeLeft.minutes < 1 && showAlert) {
    let text = 'En menos de 1 minuto esta sala se cerrará automáticamente.';
    text+= user.userType === 'Doctor' ? ' Favor darle cierre a la cita o llamar al usuario y terminarla por otro medio' : 'Gracias por usar nuestros servicios.';
    window.growl('danger', text);
    setShowAlert(false);
  }

  return (
    // show countdown only for doctors when 10 minutes remaining. User see 'Cerrando cita' when 5
    // minutes remaining
    <span className={classes.container}>
      { timeLeft.minutes < 10 && user.userType === 'Doctor' ? (
        <span>
        { timeLeft.minutes < 10 ? `0${ timeLeft.minutes }` : timeLeft.minutes }:{ timeLeft.seconds < 10 ? `0${ timeLeft.seconds }` : timeLeft.seconds }
        </span>
      ) : timeLeft.minutes < 5 && user.userType === 'User' ? ( <span>Cerrando cita</span> ) : ( <span>Cita en proceso</span> )
      }
    </span>
  )
}
