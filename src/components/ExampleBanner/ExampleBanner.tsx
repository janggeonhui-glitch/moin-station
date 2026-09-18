import styles from './ExampleBanner.module.css';

export function ExampleBanner({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.banner}>
      <p>
        <strong>예시 모임</strong>을 보여드리는 중이에요 — 노원·신도림·판교에서 출발하는 세 친구.
        멤버를 추가하면 바로 우리 모임으로 바뀌어요.
      </p>
      <button type="button" className="btn btn--ghost btn--sm" onClick={onStart}>
        예시 지우고 시작
      </button>
    </div>
  );
}
