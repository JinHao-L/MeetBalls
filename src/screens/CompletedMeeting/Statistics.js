import Chart from 'react-google-charts';
import { Row, Col, Card } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { getFormattedDuration } from '../../common/CommonFunctions';

export default function Statistics({ meeting }) {
  const [attendance, setAttendance] = useState(null);
  const [totalDuration, setTotalDuration] = useState([0, 0]);
  const [durationComparison, setDurationComparison] = useState([]);

  useEffect(() => {
    getAttendance();
    getDuration();
  }, []);

  function getAttendance() {
    const newAttendance = [
      ['Status', 'Count'],
      ['Present', 0],
      ['Absent', 0],
    ];
    meeting.participants.forEach((participant) => {
      if (participant.isDuplicate) return;
      if (participant.timeJoined === null) {
        newAttendance[2][1]++;
      } else {
        newAttendance[1][1]++;
      }
    });
    setAttendance(newAttendance);
  }

  function getDuration() {
    var actualDuration = 0;
    var expectedDuration = 0;
    var durationItems = [
      ['index', 'actual', 'expected'],
      ['', 0, 0],
    ];
    for (let i = 0; i < meeting.agendaItems.length; i++) {
      const item = meeting.agendaItems[i];
      actualDuration += item.actualDuration;
      expectedDuration += item.expectedDuration;
      durationItems.push([
        ' ',
        actualDuration / 60000,
        expectedDuration / 60000,
      ]);
    }
    setTotalDuration([actualDuration, expectedDuration]);
    setDurationComparison(durationItems);
  }

  return (
    <Row>
      <Col sm={12} md={6} lg={6} className="Container__padding--vertical-small">
        <Card className="Card__statistics">
          <Card.Body>
            <Card.Title>Attendance</Card.Title>
            <Chart
              chartType="PieChart"
              data={attendance}
              options={{
                legend: 'none',
                pieSliceText: 'label',
                colors: ['4CA982', 'f65454'],
                pieSliceTextStyle: {
                  fontSize: 13,
                },
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </Card.Body>
        </Card>
      </Col>
      <Col sm={12} md={6} lg={6} className="Container__padding--vertical-small">
        <Card className="Card__statistics">
          <Card.Body>
            <Card.Title>Total Duration</Card.Title>
            <div
              className="Container__center--vertical"
              style={{
                height: 190,
                alignItems: 'center',
              }}
            >
              <p className="Text__header" style={{ color: '#725546' }}>
                {getFormattedDuration(
                  Math.floor(totalDuration[0] / 60000) * 60000,
                )}
              </p>
              <p className="Text__hint">
                {totalDuration[0] > totalDuration[1]
                  ? 'Exceeeded by ' +
                    getFormattedDuration(
                      Math.floor(
                        (totalDuration[0] - totalDuration[1]) / 60000,
                      ) * 60000,
                    )
                  : ''}
              </p>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col
        sm={12}
        md={12}
        lg={12}
        className="Container__padding--vertical-small"
      >
        <Card className="Card__statistics">
          <Card.Body>
            <Card.Title>Duration Comparison</Card.Title>
            <Chart
              chartType="AreaChart"
              data={durationComparison}
              rootProps={{ 'data-testid': '1' }}
              options={{
                legend: { position: 'top', maxLines: 3 },
                colors: ['8F6B58', 'f28f71'],
              }}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
