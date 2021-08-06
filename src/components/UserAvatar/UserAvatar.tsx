import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import makeStyles from '@material-ui/styles/makeStyles';
import AvatarIcon from '../../icons/AvatarIcon';
import { useAppState } from './../../state';

const useStyles = makeStyles((theme) => ({
  big: {
    width: theme.spacing(9),
    height: theme.spacing(9),
  },
}));

export default function UserAvatar() {
  const classes = useStyles();
  const { user } = useAppState();

  return user.photoURL ? <Avatar src={user.photoURL} className={classes.big}/> : <AvatarIcon />;
}