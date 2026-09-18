import { TRANSIT } from '../../lib/geo';
import styles from './HowItWorks.module.css';

export function HowItWorks() {
  const kmh = Math.round(TRANSIT.speedKmPerMin * 60);
  return (
    <section className={`panel ${styles.card}`} aria-labelledby="how-title">
      <h2 id="how-title" className="eyebrow">
        이렇게 계산해요
      </h2>
      <p>
        출발역에서 후보 역까지 직선거리로 지하철 시간을 <b>추정</b>해요. 평균 {kmh}km/h, 선로 우회 {TRANSIT.detour}배,
        대기 {TRANSIT.waitMin}분, 겹치는 노선이 없으면 환승 +{TRANSIT.transferMin}분.
      </p>
      <dl className={styles.modes}>
        <div>
          <dt>거리 중간</dt>
          <dd>가장 오래 걸리는 사람의 시간과 편차가 작은 역</dd>
        </div>
        <div>
          <dt>취향 저격</dt>
          <dd>조금 멀어도 모두의 취향이 가장 많이 겹치는 동네</dd>
        </div>
        <div>
          <dt>핫플·팝업</dt>
          <dd>요즘 붐비고 팝업·행사가 자주 열리는 곳</dd>
        </div>
      </dl>
    </section>
  );
}
