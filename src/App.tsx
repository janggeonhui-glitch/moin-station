import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { AreaDetail } from './components/AreaDetail/AreaDetail';
import { CandidateList } from './components/CandidateList/CandidateList';
import { ExampleBanner } from './components/ExampleBanner/ExampleBanner';
import { Header } from './components/Header/Header';
import { HowItWorks } from './components/HowItWorks/HowItWorks';
import { MemberPanel } from './components/MemberPanel/MemberPanel';
import { ModeTabs } from './components/ModeTabs/ModeTabs';
import { MODES, tabId } from './components/ModeTabs/modes';
import { Toast } from './components/ui/Toast';
import { useMeetup } from './hooks/useMeetup';
import { useTheme } from './hooks/useTheme';
import { rankCandidates, scoreAreas } from './lib/scoring';
import styles from './App.module.css';

// Leaflet(~150KB)은 첫 화면에 필요 없으니 별도 chunk로 지연 로딩
const MeetMap = lazy(() => import('./components/MeetMap/MeetMap'));

const PANEL_ID = 'results-panel';
const STACKED_QUERY = '(max-width: 1100px)';

export default function App() {
  const { state, dispatch, buildShareUrl } = useMeetup();
  const theme = useTheme();
  const [toast, setToast] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const candidates = useMemo(() => scoreAreas(state.members), [state.members]);
  const ranked = useMemo(() => rankCandidates(candidates, state.mode), [candidates, state.mode]);
  const selected = ranked.find((c) => c.area.id === state.selectedId) ?? ranked[0];
  const modeTitle = MODES.find((m) => m.mode === state.mode)?.title ?? '';

  const clearToast = useCallback(() => setToast(null), []);

  const handleShare = useCallback(async () => {
    const url = buildShareUrl();
    const isTouch = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (isTouch && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: '어디서만나', text: '우리 모임 중간역 같이 정해보자!', url });
      } catch {
        /* 사용자가 공유 시트를 닫은 경우 */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast('모임 링크를 복사했어요. 친구에게 보내면 같은 화면이 열려요.');
    } catch {
      setToast('링크를 복사하지 못했어요. 주소창의 링크를 직접 복사해 주세요.');
    }
  }, [buildShareUrl]);

  const selectFromList = useCallback(
    (id: string) => {
      dispatch({ type: 'select', id });
      // 한 줄 레이아웃에서는 목록 아래 상세로 스크롤해 선택 결과를 바로 보여준다
      if (typeof window.matchMedia === 'function' && window.matchMedia(STACKED_QUERY).matches) {
        const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        requestAnimationFrame(() => detailRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' }));
      }
    },
    [dispatch],
  );

  const memberCount = state.members.length;

  return (
    <div className={styles.page}>
      <a href="#results" className="skip-link">
        추천 결과로 건너뛰기
      </a>

      <Header
        themePref={theme.pref}
        onCycleTheme={theme.cycle}
        onShare={handleShare}
        canShare={!state.isExample && memberCount > 0}
      />

      {state.isExample && <ExampleBanner onStart={() => dispatch({ type: 'startFresh' })} />}

      <div className={styles.grid}>
        <aside className={styles.aside}>
          <MemberPanel
            members={state.members}
            isExample={state.isExample}
            onAdd={(member) => dispatch({ type: 'add', member })}
            onRemove={(id) => dispatch({ type: 'remove', id })}
          />
          <HowItWorks />
        </aside>

        <main id="results" className={styles.main}>
          <section className={`panel ${styles.mapCard}`} aria-labelledby="map-title">
            <div className={styles.mapHead}>
              <h2 id="map-title" className="section-title">
                {modeTitle} 지도
              </h2>
              <p className={styles.mapSub}>
                {memberCount
                  ? `${memberCount}명 출발 · 후보 ${ranked.length}곳${selected ? ` · ${selected.area.name} 선택됨` : ''}`
                  : '멤버를 추가하면 지도에 경로가 그려져요'}
              </p>
            </div>
            <Suspense fallback={<div className={styles.mapFallback}>지도를 불러오는 중…</div>}>
              <MeetMap
                members={state.members}
                candidates={ranked}
                selected={selected}
                onSelect={(id) => dispatch({ type: 'select', id })}
                theme={theme.resolved}
              />
            </Suspense>
          </section>

          <ModeTabs value={state.mode} onChange={(mode) => dispatch({ type: 'setMode', mode })} panelId={PANEL_ID} />

          <div id={PANEL_ID} role="tabpanel" aria-labelledby={tabId(state.mode)} className={styles.results}>
            {ranked.length > 0 && selected ? (
              <>
                <CandidateList
                  candidates={ranked}
                  mode={state.mode}
                  selectedId={selected.area.id}
                  onSelect={selectFromList}
                />
                <div ref={detailRef} className={styles.detailSlot}>
                  <AreaDetail
                    key={selected.area.id}
                    candidate={selected}
                    members={state.members}
                    modeTitle={modeTitle}
                  />
                </div>
              </>
            ) : (
              <p className={`panel ${styles.empty}`}>
                출발지를 한 명 이상 넣으면
                <br />
                후보 역과 놀거리가 여기 나타나요.
              </p>
            )}
          </div>

          <p className={styles.foot}>
            소요 시간은 직선거리 기반 추정치예요. 실제 경로와 막차 시간은 지도 앱에서 확인하세요. 맛집·팝업은
            매주 바뀌기 때문에 앱에 저장하지 않고, 각 동네의 검색 링크로 최신 정보를 보여드려요.
          </p>
        </main>
      </div>

      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
