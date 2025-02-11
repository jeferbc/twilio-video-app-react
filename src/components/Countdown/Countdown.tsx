import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import useCountdown from '../../hooks/useCountdown/useCountdown'
import { useAppState } from '../../state';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';

const useStyles = makeStyles(() => ({
  container: {
    marginLeft: '1em',
    fontSize: '1em',
  },
  link: {
    color: 'rgb(40, 42, 43)',
    fontWeight: 'bold',
  },
}));

export default function Countdown() {
  const classes = useStyles();
  const { user } = useAppState();
  const timeLeft = useCountdown();
  const { room } = useVideoContext();
  const participants = Array.from(room?.participants.values() ?? []);

  const [alertShown, setAlertShown] = useState({ finalMinute: false });

  const timeForHelp = 50;
  const isDoctor = user?.userType === 'Doctor';
  const noParticipants = participants.length === 0;
  const noParticipantConnectedText = `Hola, yo ${user?.displayName} estoy en la sala esperando al psicólogo, pero aún no se ha conectado.`;

  const roomStatus = useMemo(() => {
    const participantConnected = sessionStorage.getItem('participantConnected');
    if (noParticipants) {
      if (!participantConnected && timeLeft.minutes < timeForHelp) {
        return isDoctor
          ? 'Esperando al paciente'
          : (
            <a
              href={`https://wa.me/573184310302?text=${encodeURIComponent(noParticipantConnectedText)}`}
              target="_blank"
              className={classes.link}
              rel="noopener noreferrer"
            >
              Contáctanos
            </a>
          );
      }
      return isDoctor ? 'Esperando al paciente' : 'Esperando al psicólogo';
    }

    sessionStorage.setItem('participantConnected', 'true');
    return 'Cita en proceso';
  }, [noParticipants, timeLeft.minutes]);

  useEffect(() => {
    if (!alertShown.finalMinute && timeLeft.minutes < 1) {
      const message = isDoctor
        ? 'En menos de 1 minuto esta sala se cerrará automáticamente. Favor darle cierre a la cita o llamar al usuario y terminarla por otro medio.'
        : 'En menos de 1 minuto esta sala se cerrará automáticamente.';
      
      window.growl('danger', message);
      setAlertShown(prev => ({ ...prev, finalMinute: true }));
    }
  }, [timeLeft.minutes, alertShown.finalMinute, isDoctor]);

  useEffect(() => {
    const noParticipantsAlert = sessionStorage.getItem('noParticipantsAlert');
    if (!noParticipantsAlert && noParticipants && timeLeft.minutes < timeForHelp) {
      const noParticipantMessage = isDoctor
        ? 'El paciente aún no ha ingresado a la sala. Por favor, comuníquese con él.'
        : `<a href='https://wa.me/573184310302?text=${encodeURIComponent(noParticipantConnectedText)}'
              target='_blank'
              class='${classes.link}'
              rel='noopener noreferrer'>
             El psicólogo aún no se ha conectado. Por favor, solicita ayuda haciendo clic aquí.
           </a>`;

      window.growl('danger', noParticipantMessage);
      sessionStorage.setItem('noParticipantsAlert', 'true');
    }
  }, [noParticipants, timeLeft.minutes, alertShown.noParticipants, isDoctor, classes.link, noParticipantConnectedText]);

  return (
    <span className={classes.container}>
      {isDoctor && timeLeft.minutes < 10 ? (
        <span>
          {`${timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}`}:
          {`${timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}`}
        </span>
      ) : !isDoctor && timeLeft.minutes < 5 ? (
        <span>Cerrando cita</span>
      ) : (
        <span>{roomStatus}</span>
      )}
    </span>
  );
}
