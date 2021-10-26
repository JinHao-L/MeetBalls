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
    var durationItems = [['name', 'actual', 'expected']];
    for (let i = 0; i < meeting.agendaItems.length; i++) {
      const item = meeting.agendaItems[i];
      actualDuration += item.actualDuration;
      expectedDuration += item.expectedDuration;
      durationItems.push([
        item.name,
        item.actualDuration / 60000,
        item.expectedDuration / 60000,
      ]);
    }
    setTotalDuration([actualDuration, expectedDuration]);
    setDurationComparison(durationItems);
  }

  return (
    <Row>
      <Col sm={12} md={6} lg={6} className="Container__padding--vertical-small">
        <Card className="Card__statistics">
          <Card.Header>Attendance</Card.Header>
          <Card.Body>
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
          <Card.Header>Total Duration</Card.Header>
          <Card.Body>
            <div
              className="Container__center--vertical"
              style={{
                height: '100%',
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
        <Card>
          <Card.Header>Duration Comparison</Card.Header>
          <Card.Body>
            <p className="Text__paragraph">
              Hover over each bar to view more details.
            </p>
            <Chart
              chartType="BarChart"
              data={durationComparison}
              rootProps={{ 'data-testid': '1' }}
              options={{
                legend: { position: 'top', maxLines: 3 },
                colors: ['8F6B58', 'f28f71'],
                hAxis: {
                  title: 'Duration (mins)',
                  minValue: 0,
                },
                vAxis: {
                  title: 'Agenda Item',
                  textPosition: 'none',
                },
                height: durationComparison.length * 25,
              }}
            />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
