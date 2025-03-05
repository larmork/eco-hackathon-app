import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useDatabase } from '../hooks/useDatabase';

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 46.062615,
  lng: 36.854095,
};

const WelcomeMessage = ({ onClose }) => {
  return (
    <div className="welcome-message">
      <div className="welcome-content">
        <h2>Добро пожаловать на интерактивную карту! 🗺️</h2>
        <div className="instructions">
          <p><strong>Как пользоваться:</strong></p>
          <ul>
            <li>👆 Нажмите в любом месте карты, чтобы добавить метку</li>
            <li>📝 Добавьте название и описание для отмеченных мест</li>
            <li>🗑️ Удаляйте ненужные метки</li>
            <li>👀 Нажмите на существующие метки для просмотра деталей</li>
          </ul>
        </div>
        <button onClick={onClose}>Понятно!</button>
      </div>
    </div>
  );
};

const PinModal = ({ pin, onSave, onClose }) => {
  const [title, setTitle] = useState(pin?.title || '');
  const [description, setDescription] = useState(pin?.description || '');
  const [category, setCategory] = useState(pin?.category || 'general');
  const [size, setSize] = useState(pin?.size || 'medium');
  const [status, setStatus] = useState(pin?.status || 'active');
  const [showHistory, setShowHistory] = useState(false);

  const categories = [
    { value: 'general', label: '🗑️ Бытовой мусор', color: 'blue', description: 'Обычные бытовые отходы' },
    { value: 'construction', label: '🏗️ Строительный мусор', color: 'orange', description: 'Остатки стройматериалов' },
    { value: 'warning', label: '⚠️ Опасные отходы', color: 'red', description: 'Химикаты, батареи и т.д.' },
    { value: 'plastic', label: '♻️ Пластик', color: 'yellow', description: 'Пластиковые отходы' },
    { value: 'info', label: '📦 Пункт приема', color: 'green', description: 'Пункт сбора отходов' },
    { value: 'event', label: '🎉 Субботник', color: 'purple', description: 'Место проведения уборки' }
  ];

  const sizes = [
    { value: 'small', label: '🟢 Небольшая', description: 'До 10м²' },
    { value: 'medium', label: '🟡 Средняя', description: '10-50м²' },
    { value: 'large', label: '🔴 Большая', description: 'Более 50м²' }
  ];

  const statuses = [
    { value: 'active', label: '⚡ Активная', description: 'Требует внимания' },
    { value: 'inProgress', label: '🔄 В работе', description: 'Уборка запланирована' },
    { value: 'resolved', label: '✅ Убрано', description: 'Проблема решена' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const currentState = {
      title,
      description,
      category,
      size,
      status,
      updatedAt: now
    };

    // Create history entry if status or size changed
    const history = pin.history || [];
    if (pin.id && (status !== pin.status || size !== pin.size)) {
      history.push({
        date: now,
        previousStatus: pin.status,
        newStatus: status,
        previousSize: pin.size,
        newSize: size,
        note: `Изменение: ${getStatusLabel(pin.status)} → ${getStatusLabel(status)}`
      });
    }

    onSave({ 
      ...pin, 
      ...currentState,
      history,
      created: pin.created || now
    });
    onClose();
  };

  const getCurrentCategory = () => categories.find(cat => cat.value === category);
  const getCurrentSize = () => sizes.find(s => s.value === size);
  const getCurrentStatus = () => statuses.find(s => s.value === status);

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: '⚡ Активная',
      inProgress: '🔄 В работе',
      resolved: '✅ Убрано'
    };
    return statusLabels[status] || status;
  };

  const getSizeLabel = (size) => {
    const sizes = {
      small: '🟢 Небольшая',
      medium: '🟡 Средняя',
      large: '🔴 Большая'
    };
    return sizes[size] || size;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{pin.id ? 'Редактировать метку' : 'Новая метка'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Тип проблемы:</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <small className="help-text">{getCurrentCategory()?.description}</small>
          </div>

          <div className="form-group">
            <label>Размер территории:</label>
            <select 
              value={size} 
              onChange={(e) => setSize(e.target.value)}
              className="size-select"
            >
              {sizes.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <small className="help-text">{getCurrentSize()?.description}</small>
          </div>

          <div className="form-group">
            <label>Статус:</label>
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="status-select"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <small className="help-text">{getCurrentStatus()?.description}</small>
          </div>

          <div className="form-group">
            <label>Название места:</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Например: Свалка у дороги"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Подробное описание:</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите что вы видите, как добраться, что нужно для уборки..."
              required
              className="form-textarea"
            />
          </div>

          <div className="form-group location-info">
            <label>Местоположение:</label>
            <p className="coordinates">
              📍 Широта: {pin?.lat.toFixed(6)}
              <br />
              📍 Долгота: {pin?.lng.toFixed(6)}
            </p>
          </div>

          {pin.created && (
            <div className="form-group">
              <label>Добавлено:</label>
              <p className="date">{new Date(pin.created).toLocaleString('ru-RU')}</p>
            </div>
          )}

          {pin.id && (
            <div className="form-group">
              <div className="history-header">
                <label>История изменений:</label>
                <button 
                  type="button" 
                  className="btn-toggle-history"
                  onClick={() => setShowHistory(!showHistory)}
                >
                  {showHistory ? '🔼 Скрыть' : '🔽 Показать'}
                </button>
              </div>
              
              {showHistory && pin.history && pin.history.length > 0 ? (
                <div className="history-list">
                  {pin.history.map((entry, index) => (
                    <div key={index} className="history-item">
                      <div className="history-date">
                        {new Date(entry.date).toLocaleString('ru-RU')}
                      </div>
                      <div className="history-change">
                        <div>Статус: {getStatusLabel(entry.previousStatus)} → {getStatusLabel(entry.newStatus)}</div>
                        <div>Размер: {getSizeLabel(entry.previousSize)} → {getSizeLabel(entry.newSize)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : showHistory && (
                <p className="no-history">История изменений пуста</p>
              )}
            </div>
          )}

          <div className="modal-buttons">
            <button type="submit" className="btn-save">
              {pin.id ? '💾 Обновить' : '✨ Создать'}
            </button>
            <button type="button" onClick={onClose} className="btn-cancel">
              ❌ Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SidePanel = ({ pins, onSelect, onDelete }) => {
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date', 'status', 'size'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [groupBy, setGroupBy] = useState('none'); // 'none', 'status', 'category'

  // Filter pins
  const filteredPins = pins
    .filter(pin => filter === 'all' || pin.category === filter)
    .filter(pin => statusFilter === 'all' || pin.status === statusFilter)
    .filter(pin => 
      searchTerm === '' || 
      pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pin.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Sort pins
  const sortedPins = [...filteredPins].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? new Date(b.created) - new Date(a.created)
        : new Date(a.created) - new Date(b.created);
    }
    if (sortBy === 'status') {
      const statusOrder = { active: 0, inProgress: 1, resolved: 2 };
      return sortOrder === 'desc'
        ? statusOrder[b.status] - statusOrder[a.status]
        : statusOrder[a.status] - statusOrder[b.status];
    }
    if (sortBy === 'size') {
      const sizeOrder = { small: 0, medium: 1, large: 2 };
      return sortOrder === 'desc'
        ? sizeOrder[b.size] - sizeOrder[a.size]
        : sizeOrder[a.size] - sizeOrder[b.size];
    }
    return 0;
  });

  // Group pins
  const groupedPins = () => {
    if (groupBy === 'none') return { 'Все метки': sortedPins };
    
    return sortedPins.reduce((groups, pin) => {
      const key = groupBy === 'status' 
        ? getStatusLabel(pin.status)
        : categories.find(c => c.value === pin.category)?.label || 'Другое';
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(pin);
      return groups;
    }, {});
  };

  const categories = [
    { value: 'all', label: '🗺️ Все метки' },
    { value: 'general', label: '🗑️ Бытовой мусор' },
    { value: 'construction', label: '🏗️ Строительный мусор' },
    { value: 'warning', label: '⚠️ Опасные отходы' },
    { value: 'plastic', label: '♻️ Пластик' },
    { value: 'info', label: '📦 Пункты приема' },
    { value: 'event', label: '🎉 Субботники' }
  ];

  const statuses = [
    { value: 'all', label: '📋 Все статусы' },
    { value: 'active', label: '⚡ Активные' },
    { value: 'inProgress', label: '🔄 В работе' },
    { value: 'resolved', label: '✅ Убранные' }
  ];

  const sortOptions = [
    { value: 'date', label: '📅 По дате' },
    { value: 'status', label: '📊 По статусу' },
    { value: 'size', label: '📏 По размеру' }
  ];

  const groupOptions = [
    { value: 'none', label: '📑 Без группировки' },
    { value: 'status', label: '📊 По статусу' },
    { value: 'category', label: '🏷️ По категории' }
  ];

  const getSizeLabel = (size) => {
    const sizes = {
      small: '🟢 Небольшая',
      medium: '🟡 Средняя',
      large: '🔴 Большая'
    };
    return sizes[size] || size;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      active: '⚡ Активная',
      inProgress: '🔄 В работе',
      resolved: '✅ Убрано'
    };
    return statusLabels[status] || status;
  };

  return (
    <div className="side-panel">
      <div className="panel-header">
        <h3>Отмеченные места <span className="count">({filteredPins.length})</span></h3>
        
        <div className="search-box">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Поиск по названию или описанию..."
            className="search-input"
          />
        </div>

        <div className="filter-section">
          <div className="filter-row">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="category-filter"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <div className="sort-controls">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <button 
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
                className="sort-direction"
                title={sortOrder === 'asc' ? "По возрастанию" : "По убыванию"}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="group-select"
            >
              {groupOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="pins-list">
        {Object.entries(groupedPins()).map(([group, groupPins]) => (
          <div key={group} className="pin-group">
            {groupBy !== 'none' && (
              <h4 className="group-header">
                {group} <span className="count">({groupPins.length})</span>
              </h4>
            )}
            
            {groupPins.map(pin => (
              <div key={pin.id} className={`pin-item category-${pin.category} status-${pin.status}`}>
                <div onClick={() => onSelect(pin)} className="pin-content">
                  <div className="pin-header">
                    <h4>{pin.title}</h4>
                    <span className="pin-size">{getSizeLabel(pin.size)}</span>
                  </div>
                  <p className="pin-status">{getStatusLabel(pin.status)}</p>
                  <p className="pin-description">{pin.description}</p>
                  <p className="pin-meta">
                    <span className="pin-date">
                      {new Date(pin.created).toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <br />
                    <span className="pin-coords">
                      📍 {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
                    </span>
                  </p>
                </div>
                <div className="pin-actions">
                  <button onClick={() => onSelect(pin)} className="btn-edit">
                    ✏️ Изменить
                  </button>
                  <button onClick={() => onDelete(pin.id)} className="btn-delete">
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {filteredPins.length === 0 && (
          <div className="no-pins">
            <p>В этой категории нет меток.</p>
            <p>Нажмите в любом месте карты, чтобы добавить!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const About = () => {
  const { pins: dbPins, loading: dbLoading, error: dbError, addPin, updatePin, deletePin, loadPins } = useDatabase();
  const [selectedPin, setSelectedPin] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const mapRef = useRef(null);

  // Load welcome message preference
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    }
  }, []);

  // Handle modal body scroll
  useEffect(() => {
    if (selectedPin) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [selectedPin]);

  const handleMapLoad = useCallback((map) => {
    console.log('Map loaded');
    mapRef.current = map;
    setMapLoaded(true);
  }, []);

  const handleMapError = useCallback((error) => {
    console.error('Map error:', error);
    setMapError('Failed to load Google Maps');
  }, []);

  const handleMapClick = useCallback((event) => {
    if (!event.latLng) return;
    
    const newPin = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
      title: '',
      description: '',
      category: 'general',
      size: 'medium',
      status: 'active',
      created: new Date().toISOString(),
      history: []
    };
    setSelectedPin(newPin);
  }, []);

  const handlePinSave = async (pinData) => {
    try {
      const pin = {
        ...pinData,
        lat: Number(pinData.lat),
        lng: Number(pinData.lng),
        history: pinData.history || []
      };

      if (pin.id) {
        await updatePin(pin.id, pin);
      } else {
        await addPin(pin);
      }
      setSelectedPin(null);
      // Reload pins to ensure we have the latest data
      await loadPins();
    } catch (err) {
      console.error('Error saving pin:', err);
      alert('Произошла ошибка при сохранении метки. Пожалуйста, попробуйте еще раз.');
    }
  };

  const handlePinDelete = async (pinId) => {
    if (window.confirm('Вы уверены, что хотите удалить эту метку?')) {
      try {
        await deletePin(pinId);
        // Reload pins to ensure we have the latest data
        await loadPins();
      } catch (err) {
        console.error('Error deleting pin:', err);
        alert('Произошла ошибка при удалении метки. Пожалуйста, попробуйте еще раз.');
      }
    }
  };

  const handlePinClick = useCallback((pin) => {
    setSelectedPin(pin);
  }, []);

  const handleCloseWelcome = useCallback(() => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPin(null);
  }, []);

  const categoryIcons = {
    general: '📍',
    warning: '⚠️',
    info: 'ℹ️',
    event: '🎉',
    construction: '🏗️',
    plastic: '♻️'
  };

  if (dbLoading && !mapLoaded) {
    return (
      <div className="map-container">
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          padding: '2em',
          background: 'white',
          borderRadius: '1em',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2>Загрузка данных...</h2>
          <p>Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  if (dbError || mapError) {
    return (
      <div className="map-container">
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          padding: '2em',
          background: 'white',
          borderRadius: '1em',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <h2>Ошибка загрузки</h2>
          <p>{dbError || mapError}</p>
          <button 
            onClick={loadPins}
            style={{
              padding: '0.5em 1em',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '0.5em',
              cursor: 'pointer'
            }}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      {showWelcome && <WelcomeMessage onClose={handleCloseWelcome} />}
      
      <SidePanel 
        pins={dbPins}
        onSelect={handlePinClick}
        onDelete={handlePinDelete}
      />

      <div className="map">
        <div className="map-tooltip">
          Нажмите в любом месте карты, чтобы добавить метку
        </div>
        {!process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
          <div className="map-error">
            <h3>Ошибка загрузки карты</h3>
            <p>API ключ Google Maps не найден. Пожалуйста, проверьте файл .env</p>
          </div>
        ) : (
          <LoadScript 
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
            onError={(error) => {
              console.error('Google Maps Script Error:', error);
              setMapError('Ошибка загрузки Google Maps: ' + (error.message || 'Проверьте консоль для деталей'));
            }}
            onLoad={() => {
              console.log('Google Maps Script loaded successfully');
              setMapError(null);
            }}
            loadingElement={
              <div style={{ height: '100%' }}>
                <div style={{ 
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  Загрузка карты...
                </div>
              </div>
            }
          >
            {mapError ? (
              <div className="map-error">
                <h3>Ошибка карты</h3>
                <p>{mapError}</p>
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={center}
                onClick={handleMapClick}
                onLoad={(map) => {
                  console.log('Map component loaded');
                  handleMapLoad(map);
                }}
                onError={(error) => {
                  console.error('Map Error:', error);
                  setMapError('Ошибка инициализации карты');
                }}
                options={{
                  styles: [
                    {
                      featureType: "all",
                      elementType: "all",
                      stylers: [
                        { saturation: -50 }
                      ]
                    }
                  ],
                  gestureHandling: 'greedy',
                  disableDoubleClickZoom: true
                }}
              >
                {dbPins && dbPins.map((mark) => (
                  <Marker
                    key={mark.id}
                    position={{ 
                      lat: parseFloat(mark.lat), 
                      lng: parseFloat(mark.lng)
                    }}
                    onClick={() => handlePinClick(mark)}
                    label={{
                      text: categoryIcons[mark.category] || '📍',
                      className: 'marker-label'
                    }}
                    title={mark.title}
                  />
                ))}
              </GoogleMap>
            )}
          </LoadScript>
        )}
      </div>

      {selectedPin && (
        <PinModal
          pin={selectedPin}
          onSave={handlePinSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default About;



