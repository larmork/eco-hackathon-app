import React from "react";
import "../App.css";

const Work = () => {
  return (
    <div className="wrapper">
      <div className="work-section-top">
        <h1 className="primary-heading-work">Как это работает</h1>
      </div>
      <div className="work-section-wrapper">
        <div className="work-section">
          <div className="info-boxes-img-container"></div>
          <h2 className="work-head">Отправляйте фото</h2>
          <p>Фотография и дополнительная информация отправляется в нашу базу данных</p>
        </div>
        <div className="work-section">
          <div className="info-boxes-img-container"></div>
          <h2 className="work-head">Смотрите карту</h2>
          <p>Пользуйтесь "режимом волонтёра" чтобы отслеживать ближайшие свалки</p>
        </div>
        <div className="work-section">
          <div className="info-boxes-img-container"></div>
          <h2 className="work-head">Действуйте!</h2>
          <p>Даёшь децентрализацию! Не нужно ждать особого мероприятия, помогайте природе при первой же возможности</p>
        </div>
      </div>
    </div>
  );
};

export default Work;