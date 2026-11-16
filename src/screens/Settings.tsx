'use client';

import { useEffect, useRef, useState } from 'react';
import { buildClassLink, useGame } from '../store/game';
import { LABELS } from './labels';

const TEACHER_POINTS = [
  '설정에서 열 구간과 소리를 골라 수업 링크를 만들 수 있어요. 링크로 연 구간은 이번 접속에서만 열리고, 학생의 별과 기록은 그대로 남아요.',
  '1~3구간과 4~6구간으로 나누면 한 묶음이 30분 안팎일 것으로 예상해요. 아직 학생 수업으로 확인하지 않은 시간이에요.',
  '전자칠판에서는 자유 눈길로 시범을 보이고 몸으로 따라 걸어 보세요. 톡은 발끝으로, 꾹은 끝까지 눌러, 스르륵은 미끄러지듯, 쿵·쾅은 발을 굴러 표현해요.',
  '교실에서는 소리를 끄고도 필수 미션을 모두 진행할 수 있어요. 귀로 맞히기는 이어폰이나 개별 활동을 권해요.',
  '마르카토는 자료에 따라 “악센트보다 더 강하고 분명하게”로 설명해요. “음 하나하나를 똑똑하게”로 가르치는 자료도 있어요.',
  '스타카토 30% 같은 길이와 세기의 값은 차이가 잘 드러나게 정한 학습용 값이에요. 실제 연주의 표준값은 아니에요.',
  '이 앱의 이음줄은 항상 높이가 다른 음을 이어요. 이음줄과 붙임줄의 구분은 다루지 않아요.',
  '다섯 기호가 교과서에 실리는 학년은 스타카토만 확인했어요. 수업 범위는 선생님이 수업 링크로 정해 주세요.',
] as const;

const LICENSE = `Copyright © 2026, Steinberg Media Technologies GmbH (http://www.steinberg.net/),
with Reserved Font Name "Bravura".

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
http://scripts.sil.org/OFL

-----------------------------------------------------------
SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007
-----------------------------------------------------------

PREAMBLE
The goals of the Open Font License (OFL) are to stimulate worldwide
development of collaborative font projects, to support the font creation
efforts of academic and linguistic communities, and to provide a free and
open framework in which fonts may be shared and improved in partnership
with others.

The OFL allows the licensed fonts to be used, studied, modified and
redistributed freely as long as they are not sold by themselves. The
fonts, including any derivative works, can be bundled, embedded,
redistributed and/or sold with any software provided that any reserved
names are not used by derivative works. The fonts and derivatives,
however, cannot be released under any other type of license. The
requirement for fonts to remain under this license does not apply
to any document created using the fonts or their derivatives.

DEFINITIONS
"Font Software" refers to the set of files released by the Copyright
Holder(s) under this license and clearly marked as such. This may
include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the
copyright statement(s).

"Original Version" refers to the collection of Font Software components as
distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting,
or substituting -- in part or in whole -- any of the components of the
Original Version, by changing formats or by porting the Font Software to a
new environment.

"Author" refers to any designer, engineer, programmer, technical
writer or other person who contributed to the Font Software.

PERMISSION AND CONDITIONS
Permission is hereby granted, free of charge, to any person obtaining
a copy of the Font Software, to use, study, copy, merge, embed, modify,
redistribute, and sell modified and unmodified copies of the Font
Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components,
in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled,
redistributed and/or sold with any software, provided that each copy
contains the above copyright notice and this license. These can be
included either as stand-alone text files, human-readable headers or
in the appropriate machine-readable metadata fields within text or
binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font
Name(s) unless explicit written permission is granted by the corresponding
Copyright Holder. This restriction only applies to the primary font name as
presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font
Software shall not be used to promote, endorse or advertise any
Modified Version, except to acknowledge the contribution(s) of the
Copyright Holder(s) and the Author(s) or with their explicit written
permission.

5) The Font Software, modified or unmodified, in part or in whole,
must be distributed entirely under this license, and must not be
distributed under any other license. The requirement for fonts to
remain under this license does not apply to any document created
using the Font Software.

TERMINATION
This license becomes null and void if any of the above conditions are
not met.

DISCLAIMER
THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT
OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE
COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL
DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM
OTHER DEALINGS IN THE FONT SOFTWARE.
`;

export interface SettingsProps { onHome: () => void }

export default function Settings({ onHome }: SettingsProps) {
  const { settings, soundOverride, setSound, storageAvailable, classOpen } = useGame();
  const soundOn = soundOverride ?? settings.soundOn;
  const [base, setBase] = useState('');
  const [open, setOpen] = useState(3);
  const [soundOff, setSoundOff] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const linkField = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setBase(window.location.href); }, []);
  const link = base ? buildClassLink(base, open, soundOff) : '';

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('manual-copy');
      await navigator.clipboard.writeText(link);
      setCopyStatus(LABELS.copied);
    } catch {
      linkField.current?.focus();
      linkField.current?.select();
      setCopyStatus('주소를 선택했어요. 길게 누르거나 복사 단축키로 복사해 주세요.');
    }
  }

  return (
    <div className="page-stack">
      <section className="panel settings-block" aria-labelledby="sound-title">
        <h2 id="sound-title" className="section-title">소리 설정</h2>
        <button className="button secondary" role="switch" aria-checked={soundOn}
          onClick={() => setSound(!soundOn)}>{soundOn ? LABELS.soundOn : LABELS.soundOff}</button>
        <p className="muted small">소리를 꺼도 걸음과 자국으로 모든 필수 미션을 할 수 있어요.</p>
        {soundOverride !== null && <p className="small">수업 링크의 소리 설정은 이번 접속에서만 적용돼요.</p>}
        {classOpen > 0 && <p className="small">수업용 링크로 {classOpen}구간까지 열려 있어요.</p>}
        {!storageAvailable && <p role="status" className="small">{LABELS.saveUnavailable}</p>}
      </section>

      <section className="panel settings-block" aria-labelledby="lesson-title">
        <h2 id="lesson-title" className="section-title">수업 링크 만들기</h2>
        <label className="row" htmlFor="lesson-open"><span>열 구간</span>
          <select id="lesson-open" value={open} onChange={(event) => {
            setOpen(Number(event.target.value)); setCopyStatus('');
          }}>
            {[1, 2, 3, 4, 5, 6].map((stage) => <option key={stage} value={stage}>{stage}구간까지</option>)}
          </select>
        </label>
        <label className="row" style={{ minHeight: 44 }} htmlFor="lesson-sound">
          <input id="lesson-sound" type="checkbox" checked={soundOff}
            onChange={(event) => { setSoundOff(event.target.checked); setCopyStatus(''); }} />
          <span>소리 끄고 시작</span>
        </label>
        <label htmlFor="lesson-link" className="small">학생에게 보낼 주소</label>
        <textarea id="lesson-link" className="link-output" ref={linkField} readOnly value={link}
          rows={3} onFocus={(event) => event.target.select()} aria-describedby="copy-status" />
        <button className="button" disabled={!link} onClick={() => void copyLink()}>{LABELS.copy}</button>
        <p id="copy-status" className="small" aria-live="polite">{copyStatus || '링크로 열어도 기존 진행 기록은 바뀌지 않아요.'}</p>
      </section>

      <section className="panel settings-block" aria-labelledby="teacher-title">
        <h2 id="teacher-title" className="section-title">{LABELS.teacherGuide}</h2>
        <ul>{TEACHER_POINTS.map((point) => <li key={point}>{point}</li>)}</ul>
      </section>

      <section className="panel settings-block" aria-labelledby="credits-title">
        <h2 id="credits-title" className="section-title">{LABELS.sources}</h2>
        <p>악보 기호: Bravura · Steinberg Media Technologies GmbH · SIL Open Font License 1.1</p>
        <p>글꼴: Bagel Fat One, Gowun Dodum · SIL Open Font License 1.1</p>
        <details>
          <summary style={{ minHeight: 44, cursor: 'pointer' }}>Bravura 라이선스 전문 보기</summary>
          <p className="small"><a href="https://github.com/steinbergmedia/bravura/blob/master/LICENSE.txt" target="_blank" rel="noreferrer">Bravura 라이선스 원문</a></p>
          <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12, lineHeight: 1.6 }}>{LICENSE}</pre>
        </details>
      </section>
      <button className="button secondary" onClick={onHome}>{LABELS.map}</button>
    </div>
  );
}
