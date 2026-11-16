'use client';

import { useState } from 'react';
import { KIND_INFO, KINDS, STAGES } from '../engine/engine';
import { useGame } from '../store/game';
import { LABELS, MISSION_LABELS } from './labels';

export interface RecordsProps { onHome: () => void }

function StarRow({ count }: { count: number }) {
  return <span aria-label={`별 ${count}개`} style={{ whiteSpace: 'nowrap' }}>{'★'.repeat(count)}{'☆'.repeat(3 - count)}</span>;
}

export default function Records({ onHome }: RecordsProps) {
  const { progress, resetProgress, storageAvailable } = useGame();
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');
  const total = STAGES.reduce((sum, stage) => sum + [1, 2, 3].reduce((value, mission) =>
    value + (progress.stars[`${stage.id}-${mission}`] ?? 0), 0), 0);

  return (
    <div className="page-stack">
      <section className="panel settings-block" aria-labelledby="collected-title">
        <h2 id="collected-title" className="section-title">모은 별</h2>
        <p style={{ fontSize: 28, fontWeight: 700, marginBlock: 8 }} aria-label={`별 54개 가운데 ${total}개`}>★ {total} / 54</p>
        <p className="small muted">귀로 맞히기의 별은 따로 모아요.</p>
        {!storageAvailable && <p className="small" role="status">{LABELS.saveUnavailable}</p>}
      </section>

      <section className="panel settings-block" aria-labelledby="stats-title">
        <h2 id="stats-title" className="section-title">한 번에 맞힌 비율</h2>
        <p className="small muted">표지판이 들어 있던 문제의 첫 시도 기록이에요.</p>
        <dl style={{ margin: 0 }}>
          {KINDS.map((kind) => {
            const stat = progress.stats[kind];
            return <div className="row" key={kind} style={{ minHeight: 44, justifyContent: 'space-between', gap: 12 }}>
              <dt>{KIND_INFO[kind].name}</dt>
              <dd style={{ margin: 0 }}>{stat.seen < 5 ? LABELS.notEnough : `${Math.round(stat.first / stat.seen * 100)}%`}</dd>
            </div>;
          })}
        </dl>
      </section>

      {STAGES.map((stage) => {
        const introDone = Boolean(progress.introDone[String(stage.id)] || progress.introDone[`${stage.id}-0`]);
        return <section key={stage.id} className="panel settings-block" aria-labelledby={`record-stage-${stage.id}`}>
          <h2 id={`record-stage-${stage.id}`} className="section-title">{stage.id}구간 {stage.name}</h2>
          <div className="row" style={{ minHeight: 44, justifyContent: 'space-between' }}>
            <span>{LABELS.intro}</span><span>{introDone ? '✓ 마쳤어요' : '아직 걷기 전'}</span>
          </div>
          {[1, 2, 3].map((mission) => <div className="row" key={mission} style={{ minHeight: 44, justifyContent: 'space-between' }}>
            <span>{MISSION_LABELS[mission]}</span><StarRow count={progress.stars[`${stage.id}-${mission}`] ?? 0} />
          </div>)}
          {stage.id === 6 && <div className="row" style={{ minHeight: 44, justifyContent: 'space-between' }}>
            <span>{LABELS.ear} · 선택</span><StarRow count={progress.stars['6-4'] ?? 0} />
          </div>}
        </section>;
      })}

      <section className="panel settings-block" aria-labelledby="reset-title">
        <h2 id="reset-title" className="section-title">{LABELS.clearRecords}</h2>
        {confirmReset ? <div role="group" aria-label="기록 지우기 확인">
          <p>별과 기록을 모두 지울까요? 되돌릴 수 없어요.</p>
          <p className="small muted">소리 설정은 그대로 남아요.</p>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
            <button className="button secondary" onClick={() => setConfirmReset(false)}>취소</button>
            <button className="button danger" onClick={() => {
              resetProgress(); setConfirmReset(false); setNotice('별과 기록을 지웠어요.');
            }}>모두 지우기</button>
          </div>
        </div> : <button className="button secondary danger" onClick={() => {
          setConfirmReset(true); setNotice('');
        }}>{LABELS.clearRecords}</button>}
        <p className="small" aria-live="polite">{notice}</p>
      </section>
      <button className="button secondary" onClick={onHome}>{LABELS.map}</button>
    </div>
  );
}
