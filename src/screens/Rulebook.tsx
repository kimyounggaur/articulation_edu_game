'use client';

import { useEffect, useRef } from 'react';
import { KIND_INFO, LEARNING_ORDER, type Kind } from '../engine/engine';
import { RulebookArt } from './RulebookArt';

const sections = [
  ['start', '처음 시작'], ['signs', '표지판'], ['controls', '조작 방법'],
  ['missions', '미션'], ['results', '별과 기록'], ['free', '자유 눈길'],
] as const;

const symbolTips: Record<Kind, string> = {
  stac: '점처럼 짧은 자국을 찾아보세요.',
  leg: '자국이 끊기지 않고 이어지는지 살펴보세요.',
  acc: '굵게 시작해 가늘어지는 자국을 찾아보세요.',
  ten: '한 박을 채우지만 음마다 나뉜 자국을 살펴보세요.',
  marc: '가장 굵게 시작하고 눈이 튀는 자국을 찾아보세요.',
};

export default function Rulebook({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) {
      node.showModal();
      node.scrollTop = 0;
      closeButton.current?.focus();
    } else if (!open && node.open) node.close();
  }, [open]);
  const jump = (id: string) => dialog.current?.querySelector(`#rulebook-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return <dialog ref={dialog} className="rulebook-dialog" aria-labelledby="rulebook-title" onCancel={e => { e.preventDefault(); onClose(); }} onClose={onClose}>
    <div className="rulebook-top"><div><span className="rulebook-kicker">눈길 발자국 안내서</span><h2 id="rulebook-title">그림으로 보는 게임 룰북</h2></div><button ref={closeButton} type="button" className="rulebook-close" aria-label="룰북 닫기" onClick={onClose}>×</button></div>
    <div className="rulebook-body">
      <div className="rulebook-intro"><div><span className="rulebook-kicker">WELCOME TO SNOWPATH</span><h3>표지판을 읽고<br/>음악의 눈길을 걸어요</h3><p>음표 위의 기호를 걸음과 발자국, 소리로 만나 보세요. 게임 중에도 언제든 이 룰북을 열 수 있어요.</p></div><RulebookArt kind="journey" /></div>
      <nav className="rulebook-nav" aria-label="룰북 목차">{sections.map(([id,label])=><button type="button" key={id} onClick={()=>jump(id)}>{label}</button>)}</nav>
      <section className="rulebook-section" id="rulebook-start"><span className="rulebook-kicker">01 · 시작하기</span><h3>여섯 구간의 작은 모험</h3><p>지도에서 열린 미션을 선택해요. 각 구간에서 걸음 배우기를 마치고, 길 만들기 → 걸음 읽기 → 발자국 탐정 순서로 도전해요. 앞 구간의 세 문제 미션을 마치면 다음 구간이 열려요.</p><div className="rulebook-route"><span>01 톡톡 길<small>스타카토</small></span><span>02 스르륵 길<small>레가토</small></span><span>03 쿵 길<small>악센트</small></span><span>04 꾹꾹 길<small>테누토</small></span><span>05 쾅 길<small>마르카토</small></span><span>06 눈길 끝까지<small>다섯 표현 섞기</small></span></div></section>
      <section className="rulebook-section" id="rulebook-signs"><span className="rulebook-kicker">02 · 음악 표지판</span><h3>같은 음표도 다르게 걸어요</h3><p>기호는 음을 얼마나 짧거나 길게, 또는 얼마나 힘주어 표현할지 알려 줘요. 그림과 함께 소리와 자국을 비교해 보세요.</p><div className="rulebook-sign-grid">
        {LEARNING_ORDER.map(kind=>{const info=KIND_INFO[kind];return <article className="rulebook-sign" key={kind}><RulebookArt kind={kind}/><div className="rulebook-sign-copy"><span className="rulebook-sign-word">{info.glyph} · {info.word}</span><h4>{info.name} <small>{info.english}</small></h4><p>{info.description}</p><p className="rulebook-tip">발자국 힌트 · {symbolTips[kind]}</p></div></article>;})}
        <article className="rulebook-sign"><RulebookArt kind="none"/><div className="rulebook-sign-copy"><span className="rulebook-sign-word">— · 뚜벅</span><h4>표지판 없음</h4><p>{KIND_INFO.none.description} {KIND_INFO.none.trace}</p></div></article>
      </div><p className="rulebook-note">이 게임에서 스타카토·테누토·레가토는 길이와 연결을, 악센트·마르카토는 세기를 표현해요. 테누토는 길게 눌러도 음마다 새로 시작하고, 레가토는 연결된 음을 부드럽게 이어요.</p></section>
      <section className="rulebook-section" id="rulebook-controls"><span className="rulebook-kicker">03 · 조작 방법</span><h3>고르고, 누르고, 걸어 보기</h3><div className="rulebook-feature-grid"><article><RulebookArt kind="place"/><h4>음에 표지판 붙이기</h4><p>아래에서 표지판을 고른 뒤 붙일 음을 눌러요. 같은 기호를 다시 누르면 떼어져요. ‘지우기’를 누르면 붙인 표지판과 이음줄을 모두 지워요.</p></article><article><RulebookArt kind="link"/><h4>음과 음 이어 주기</h4><p>레가토를 고른 뒤 이어 줄 두 음 사이의 점선을 눌러요. 다시 누르면 연결이 풀려요. 여러 곳을 이어 긴 이음줄도 만들 수 있어요.</p></article></div><p className="rulebook-note">이 게임에서는 이음줄로 연결된 음에 스타카토 점이나 테누토 줄을 함께 쓰지 않아요. 충돌하는 기호를 붙이면 기존 연결 또는 기호가 자동으로 제거돼요.</p></section>
      <section className="rulebook-section" id="rulebook-missions"><span className="rulebook-kicker">04 · 미션 살펴보기</span><h3>네 가지 방법으로 익혀요</h3><div className="rulebook-feature-grid">
        <article><RulebookArt kind="make"/><h4>길 만들기</h4><p>문장의 주문을 읽고 알맞은 표지판을 음에 붙여요. ‘걸어 보기’를 눌러 결과와 힌트를 확인해요.</p></article>
        <article><RulebookArt kind="read"/><h4>걸음 읽기</h4><p>악보의 기호를 보고 아래에서 알맞은 걸음 카드를 골라 해당 음이나 음 사이를 눌러요.</p></article>
        <article><RulebookArt kind="det"/><h4>발자국 탐정</h4><p>눈 위에 남은 자국을 보고 어떤 표지판인지 맞혀요. 문제에 따라 선택지에서 고르거나 직접 표지판을 붙여요.</p></article>
        <article><RulebookArt kind="ear"/><h4>귀로 맞히기 <small>선택 미션</small></h4><p>마지막 구간에서 소리를 듣고 알맞은 표지판을 골라요. 이 미션은 소리를 켜야 열려요. 필요하면 ‘다시 듣기’를 눌러요.</p></article>
      </div><p className="rulebook-note">틀려도 괜찮아요. 틀릴 때마다 도움말이 더 자세해져요. 직접 배치하는 문제는 세 번째 오답 뒤 정답을 흐리게 보여 줘요. 고르기 문제도 힌트를 따라 다시 선택할 수 있어요.</p></section>
      <section className="rulebook-section" id="rulebook-results"><span className="rulebook-kicker">05 · 별과 기록</span><h3>처음의 도전을 별로 기록해요</h3><div className="rulebook-result"><RulebookArt kind="stars"/><div><ul><li><strong>별 3개</strong> · 본 문제를 모두 첫 시도에 맞혔어요.</li><li><strong>별 2개</strong> · 본 문제의 75% 이상을 첫 시도에 맞혔어요.</li><li><strong>별 1개</strong> · 끝까지 미션을 완료했어요.</li></ul><p>헷갈린 문제를 바탕으로 최대 두 문제를 더 연습해요. 다시 풀기는 별 계산에 들어가지 않아요. 같은 미션을 다시 하면 더 높은 별 기록이 남아요.</p></div></div></section>
      <section className="rulebook-section" id="rulebook-free"><span className="rulebook-kicker">06 · 자유롭게 연주하기</span><h3>나만의 눈길을 만들어 보세요</h3><div className="rulebook-result"><RulebookArt kind="free"/><div><p>지도 아래의 ‘자유 눈길’에서 12가지 가락을 고르고, 지금까지 열린 표지판을 마음껏 붙여 볼 수 있어요. ‘걷기’를 눌러 소리와 발자국을 비교해 보세요.</p><p>자유 눈길에는 정답이나 별이 없어요. 소리를 끈 상태에서도 걸음과 자국을 볼 수 있어요.</p></div></div></section>
      <div className="rulebook-end"><p>자, 펭귄과 함께 한 걸음씩 출발해 볼까요?</p><button className="button" type="button" onClick={onClose}>게임으로 돌아가기 →</button></div>
    </div>
  </dialog>;
}
