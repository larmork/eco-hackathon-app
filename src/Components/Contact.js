import React from "react";

const events = [
  { id: 1, name: 'Субботник в Ейске', date: '2024-02-09' },
  { id: 2, name: 'Мероприятие в Таганроге', date: '2023-11-01' },
  { id: 3, name: 'Мероприятие в Мариуполе', date: '2023-09-12' },
  { id: 4, name: 'Субботник в Таганроге', date: '2023-08-05' },
  { id: 5, name: 'Мероприятие в Богудонии', date: '2022-01-05' }
];

const Contact = () => {
  return (
    <div>
      <h1 style={{marginTop: '100px' , textAlign: 'center'}}>Последние мероприятия</h1>
    <div style={{ overflowY: 'scroll', height: '200px', textAlign: 'center', marginTop: '50px' }}>
      {events.map(event => (
        <div key={event.id} className="event">
          <h3>{event.name}</h3>
          <p>Дата проведения: {event.date}</p>
        </div>
      ))}
    </div>
    </div>
  );
};

export default Contact;