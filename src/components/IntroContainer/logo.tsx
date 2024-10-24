import React from 'react';
import logoImage from '../../../../../../assets/images/logos/logo-mid.png'

export default function Logo(props) {
  return (
    <div className={props.className}>
      <img src={logoImage} alt="tranquilamente | psicólogos en línea" height={65} width={65} />
    </div>
  );
}
