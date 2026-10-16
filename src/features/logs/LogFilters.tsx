import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Notice } from '../../components/shared';
import { filterKeys, localTime, logQuery, numericFilters } from './log-filters';

const exactLabels = {
  agent_id: 'Agent ID',
  device_id: 'Device ID',
  source: 'Тип источника',
  source_id: 'Source ID',
  host: 'Host claim',
  process: 'Процесс',
  record_type: 'Тип audit-записи',
  event_id: 'Audit event ID',
  executable: 'Executable',
};
export default function LogFilters() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get('q') || params.get('contains') || '');
  const [mode, setMode] = useState(params.has('contains') ? 'contains' : 'q');
  const [draft, setDraft] = useState(
    () =>
      Object.fromEntries(filterKeys.map((k) => [k, params.get(k) || ''])) as Record<
        (typeof filterKeys)[number],
        string
      >,
  );
  const [from, setFrom] = useState(localTime(params.get('from'))),
    [to, setTo] = useState(localTime(params.get('to')));
  const [error, setError] = useState('');
  const change = (key: keyof typeof draft, value: string) => setDraft({ ...draft, [key]: value });
  return (
    <form
      className="stack-form"
      onSubmit={(e) => {
        e.preventDefault();
        const next = new URLSearchParams(params);
        for (const key of filterKeys) next.delete(key);
        next.delete('before_id');
        for (const [key, value] of Object.entries(draft))
          if (value && !['q', 'contains', 'from', 'to'].includes(key)) next.set(key, value);
        if (input) next.set(mode, input);
        try {
          if (from) next.set('from', new Date(from).toISOString());
          if (to) next.set('to', new Date(to).toISOString());
          logQuery(next);
          setError('');
          setParams(next);
        } catch (err) {
          setError((err as Error).message);
        }
      }}
    >
      <div className="toolbar">
        <input
          aria-label="Поиск по логам"
          maxLength={256}
          placeholder="Поиск по словам и фразам…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" variant="secondary">
          Найти
        </Button>
        <label>
          Уровень важности
          <select
            aria-label="Уровень важности"
            value={draft.severity}
            onChange={(e) => change('severity', e.target.value)}
          >
            <option value="">Все уровни</option>
            {['Emergency', 'Alert', 'Critical', 'Error', 'Warning', 'Notice', 'Info', 'Debug'].map(
              (v, i) => (
                <option key={v} value={i}>
                  {v}
                </option>
              ),
            )}
            <option value="unknown">Неизвестно</option>
          </select>
        </label>
      </div>
      <details className="json-view">
        <summary>Дополнительные фильтры логов и Audit</summary>
        <div className="form-grid">
          <label>
            Режим поиска
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="q">Слова и фразы</option>
              <option value="contains">Буквальная подстрока</option>
            </select>
          </label>
          <label>
            Начало периода
            <input
              type="datetime-local"
              step={1}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label>
            Конец периода
            <input
              type="datetime-local"
              step={1}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          {Object.entries(exactLabels).map(([key, label]) => (
            <label key={key}>
              {label}
              <input
                value={draft[key as keyof typeof draft]}
                onChange={(e) => change(key as keyof typeof draft, e.target.value)}
              />
            </label>
          ))}
          {numericFilters.map((key) => (
            <label key={key}>
              {key.toUpperCase()}
              <input
                type="number"
                min={0}
                max={4294967295}
                step={1}
                value={draft[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            </label>
          ))}
          <label>
            Результат Audit
            <select value={draft.success} onChange={(e) => change('success', e.target.value)}>
              <option value="">Любой</option>
              <option value="true">Успех</option>
              <option value="false">Ошибка</option>
              <option value="unknown">Неизвестен у audit-записи</option>
            </select>
          </label>
        </div>
        <Notice>
          Время вводится в часовом поясе браузера и отправляется как UTC. Подстрока требует периода
          до 7 дней. UID/AUID/PID=0 сохраняются; пустое поле снимает фильтр. Host — заявление
          источника, не доказательство идентичности. Все фильтры применяются кнопкой «Найти».
        </Notice>
      </details>
      {error && (
        <p role="alert" className="field-error">
          {error}
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          const next = new URLSearchParams(params);
          for (const key of filterKeys) next.delete(key);
          next.delete('before_id');
          setParams(next);
          setInput('');
          setMode('q');
          setDraft(Object.fromEntries(filterKeys.map((k) => [k, ''])) as typeof draft);
          setFrom('');
          setTo('');
          setError('');
        }}
      >
        Сбросить фильтры
      </Button>
    </form>
  );
}
