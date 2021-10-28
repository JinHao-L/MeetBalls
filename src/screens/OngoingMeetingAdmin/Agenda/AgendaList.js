import { useRef, useEffect } from 'react';

import CurrentItem from './CurrentItem';
import NotStartedItem from './NotStartedItem';
import ActiveItem from './ActiveItem';

export default function AgendaList({ time, agenda, position }) {
  const currentItemRef = useRef();

  useEffect(() => {
    currentItemRef?.current?.scrollIntoView({ behavior: 'smooth' });
  }, [position]);

  const items = [];
  if (position >= agenda.length) {
    for (let i = 0; i < agenda.length; i++) {
      items.push(
        <ActiveItem
          item={agenda[i]}
          key={'Item ' + i}
          isPassed={i < position}
          isEnded={true}
        />,
      );
    }
  } else {
    for (let i = 0; i < agenda.length; i++) {
      if (agenda[i].startTime === null) {
        items.push(<NotStartedItem item={agenda[i]} key={'Item ' + i} />);
      } else if (i === position) {
        items.push(
          <CurrentItem
            item={agenda[i]}
            time={time}
            key="Item Current"
            reference={currentItemRef}
          />,
        );
      } else {
        items.push(
          <ActiveItem
            item={agenda[i]}
            key={'Item ' + i}
            isPassed={i < position}
            isEnded={false}
          />,
        );
      }
    }
  }
  return (
    <>
      {items}
      <div className="Buffer--100px" />
    </>
  );
}
