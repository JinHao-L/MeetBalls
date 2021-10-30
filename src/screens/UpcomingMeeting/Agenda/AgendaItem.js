import {
  Button,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { Draggable } from 'react-beautiful-dnd';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FaLink } from 'react-icons/fa';
import { getFormattedDuration } from '../../../common/CommonFunctions';
import server from '../../../services/server';
import { defaultHeaders } from '../../../utils/axiosConfig';
import { SmallLoadingIndicator } from '../../../components/SmallLoadingIndicator';
import { extractError } from '../../../utils/extractError';
import { openFile } from '../../../services/files';
import unmount from '../../../utils/unmount';
import EditAgendaItem from './EditAgendaItem';
import AgendaItemInfoSection from '../../../components/AgendaItemComponents';

export default function AgendaItem({
  meeting,
  setMeeting,
  position,
  isReordering,
  isDeleting,
  setDeleting,
  lock,
}) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const item = meeting.agendaItems[position];
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return unmount(mounted, 'AgendaItem');
  }, []);

  if (!editing && item?.name?.length === 0) {
    setEditing(true);
  }

  async function removeAgendaItem() {
    if (isDeleting || lock.current) return;
    lock.current = true;
    try {
      setDeleting(true);
      setLoading(true);
      const newMeeting = Object.assign({}, meeting);
      const newAgenda = Object.assign([], newMeeting.agendaItems);
      const actualPosition = newAgenda[position].position;
      await removeFromDatabase(meeting.id, actualPosition);
      newAgenda.splice(position, 1);
      newMeeting.agendaItems = newAgenda;
      for (let i = 0; i < newAgenda.length; i++) {
        newAgenda[i].position = i;
        newAgenda[i].prevPosition = i;
      }
      setMeeting(newMeeting);
    } catch (err) {
      lock.current = false;
      toast.error(extractError(err));
      setLoading(false);
    }
    if (mounted.current) setDeleting(false);
  }

  if (isReordering && editing) {
    setEditing(false);
  }

  if (editing) {
    // Editing
    return (
      <>
        {loading ? (
          <div className="Container__padding--vertical-small">
            <Card>
              <div className="Buffer--50px" />
              <SmallLoadingIndicator />
              <div className="Buffer--50px" />
            </Card>
          </div>
        ) : (
          <Draggable
            draggableId={'Draggable' + item.position}
            index={position}
            isDragDisabled={true}
          >
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
              >
                <EditAgendaItem
                  setLoading={setLoading}
                  setEditing={setEditing}
                  setMeeting={setMeeting}
                  meeting={meeting}
                  position={position}
                  lock={lock}
                />
              </div>
            )}
          </Draggable>
        )}
      </>
    );
  }

  if (loading) {
    return (
      <div className="Container__padding--vertical-small">
        <Card>
          <div className="Buffer--50px" />
          <SmallLoadingIndicator />
          <div className="Buffer--50px" />
        </Card>
      </div>
    );
  }

  // Not editing
  return (
    <Draggable
      draggableId={'Draggable' + item.position}
      index={position}
      isDragDisabled={!isReordering}
    >
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Col className="Container__padding--vertical-small">
            <Card>
              <Card.Header className="Container__row--space-between">
                {getFormattedDuration(item.expectedDuration)}
                {item.speakerMaterials && item.speaker ? (
                  <OverlayTrigger placement="top" overlay={renderTooltip}>
                    <div>
                      <FaLink
                        size={20}
                        className="Clickable"
                        onClick={() =>
                          openFile(
                            item.speakerMaterials,
                            meeting.id,
                            item.speaker.id,
                          ).catch((_) => {
                            toast.error('File not found');
                          })
                        }
                      />
                    </div>
                  </OverlayTrigger>
                ) : null}
              </Card.Header>
              <AgendaItemInfoSection item={item} />
              {isReordering || (
                <Row>
                  <Col style={{ paddingRight: 0 }}>
                    <div className="d-grid gap-2">
                      <Button
                        variant="card-left-danger"
                        onClick={removeAgendaItem}
                      >
                        Remove
                      </Button>
                    </div>
                  </Col>
                  <Col style={{ paddingLeft: 0 }}>
                    <div className="d-grid gap-2">
                      <Button
                        variant="card-right"
                        onClick={() => setEditing(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  </Col>
                </Row>
              )}
            </Card>
          </Col>
        </div>
      )}
    </Draggable>
  );
}

async function removeFromDatabase(meetingId, position) {
  await server.delete(`/agenda-item/${meetingId}/${position}`, {
    headers: {
      ...defaultHeaders.headers,
      'X-Participant': sessionStorage.getItem(meetingId) || '',
    },
  });
}

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Link/File Attached
  </Tooltip>
);
