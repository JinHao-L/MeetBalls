import {
  Button,
  Row,
  Col,
  Card,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import { Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';
import { getFormattedDuration } from '../../common/CommonFunctions';
import EditAgendaItem from './EditAgendaItem';
import server from '../../services/server';
import { defaultHeaders } from '../../utils/axiosConfig';
import { SmallLoadingIndicator } from '../../components/SmallLoadingIndicator';
import { toast } from 'react-toastify';
import { Link45deg } from 'react-bootstrap-icons';
import { extractError } from '../../utils/extractError';
import { openFile } from '../../services/files';

export default function AgendaItem({
  meeting,
  setMeeting,
  position,
  isReordering,
  isDeleting,
  setDeleting,
}) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const item = meeting.agendaItems[position];

  if (!editing && item?.name?.length === 0) {
    setEditing(true);
  }

  async function removeAgendaItem() {
    if (isDeleting) return;
    try {
      setDeleting(true);
      setLoading(true);
      const newMeeting = Object.assign({}, meeting);
      const newAgenda = Object.assign([], newMeeting.agendaItems);
      const actualPosition = newAgenda[position].position;
      newAgenda.splice(position, 1);
      newMeeting.agendaItems = newAgenda;
      await removeFromDatabase(meeting.id, actualPosition);
      setMeeting(newMeeting);
      for (let i = 0; i < newAgenda.length; i++) {
        newAgenda[i].position = i;
      }
    } catch (err) {
      toast.error(extractError(err));
      setLoading(false);
    }
    setDeleting(false);
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
                />
              </div>
            )}
          </Draggable>
        )}
      </>
    );
  }

  // Not editing
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
                        <Link45deg
                          size={24}
                          className="Clickable"
                          onClick={() =>
                            openFile(
                              item.speakerMaterials,
                              meeting.id,
                              item.speaker.id,
                            ).catch((err) => {
                              toast.error('File not found');
                            })
                          }
                        />
                      </OverlayTrigger>
                    ) : null}
                  </Card.Header>
                  <Card.Body>
                    <Card.Title>{item.name}</Card.Title>
                    <Card.Subtitle>
                      {item.speaker?.userName
                        ? 'Presented by ' + item.speaker.userName
                        : ''}
                    </Card.Subtitle>
                    <div className="Buffer--5px" />
                    <Card.Text>{item.description}</Card.Text>
                  </Card.Body>
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
      )}
    </>
  );
}

async function removeFromDatabase(meetingId, position) {
  await server.delete(`/agenda-item/${meetingId}/${position}`, defaultHeaders);
}

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Link/File Attached
  </Tooltip>
);
