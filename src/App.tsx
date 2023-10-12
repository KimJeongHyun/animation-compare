import { useEffect, useRef } from "react";
import styled from "styled-components";

export default function App() {
  const ballRef = useRef<HTMLDivElement>(null);
  const ballContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // useEffect는 paint 이후 실행된다.
    // 따라서 ref들은 이미 화면에 부착되어 있을 것이므로 !를 통해 undefined가 아님을 명시한다.
    const ballContainer = ballContainerRef.current!;
    const ball = ballRef.current!;

    // 첫 방향은 우하단 방향이다.
    let vector = "botRight";

    let intervalTimer: any = null;
    const intervalBallAnimate = () => {
      // 컨테이너의 상,하,좌,우 좌표를 구한다.
      const {
        top: cTop,
        left: cLeft,
        bottom: cBottom,
        right: cRight,
      } = ballContainer.getBoundingClientRect();

      intervalTimer = setInterval(() => {
        // 공의 상,하,좌,우 좌표를 매 interval마다 구한다.
        const { top, left, bottom, right } = ball.getBoundingClientRect();

        // 맨 아래에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        if (!(cBottom - bottom - 5)) {
          // 경우에 따라 맨 아래에 닿았으면서, 맨 오른쪽에 닿았을 수도 있다. 이 때는 좌상단 대각으로 방향을 정한다.
          if (!(cRight - right - 5)) {
            vector = "topLeft";
          }
          // 경우에 따라 맨 아래에 닿았으면서, 맨 왼쪽에 닿았을 수도 있다. 이 때는 우상단 대각으로 방향을 정한다.
          if (!(left - cLeft - 5)) {
            vector = "topRight";
          }

          if (vector === "botRight") {
            vector = "topRight";
          }

          if (vector === "botLeft") {
            vector = "topLeft";
          }
        }
        // 맨 위에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        if (!(top - cTop - 5)) {
          // 경우에 따라 맨 위에 닿았으면서, 맨 오른쪽에 닿았을 수도 있다. 이 때는 좌하단 대각으로 방향을 정한다.
          if (!(cRight - right - 5)) {
            vector = "botLeft";
          }
          // 경우에 따라 맨 위에 닿았으면서, 맨 왼쪽에 닿았을 수도 있다. 이 때는 우하단 대각으로 방향을 정한다.
          if (!(left - cLeft - 5)) {
            vector = "botRight";
          }

          if (vector === "topRight") {
            vector = "botRight";
          }

          if (vector === "topLeft") {
            vector = "botLeft";
          }
        }
        // 오른쪽 끝에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        // 이미 맨 위 / 맨 아래에 닿았을 때의 조건을 상단 if문에서 처리했으니 여기에선 처리할 이유가 없다.
        if (!(cRight - right - 5)) {
          if (vector === "topRight") {
            vector = "topLeft";
          }

          if (vector === "botRight") {
            vector = "botLeft";
          }
        }
        // 왼쪽 끝에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        // 이미 맨 위 / 맨 아래에 닿았을 때의 조건을 상단 if문에서 처리했으니 여기에선 처리할 이유가 없다.
        if (!(left - cLeft - 5)) {
          if (vector === "topLeft") {
            vector = "topRight";
          }

          if (vector === "botLeft") {
            vector = "botRight";
          }
        }

        ball.style.top =
          parseFloat(ball.style.top || "0") +
          1 * (vector.includes("bot") ? 1 : -1) +
          "px";

        ball.style.left =
          parseFloat(ball.style.left || "0") +
          1 * (vector.includes("Right") ? 1 : -1) +
          "px";
      }, 1000 / 60); // 1000 / 60을 통해 1프레임이 16.6ms마다 출력되도록 지정한다.
    };

    let rafId: any;
    const frameBallAnimate = () => {
      // 컨테이너 너비 - 공 너비를 계산하면 translate 좌표계에서의 너비를 구할 수 있다. 이 때, CSS-BoxModel로 적용된 border 또한 처리해야되서 10을 빼줬다.
      // 즉, translateX = finalTranslateX면 맨 오른쪽에 닿은거고, translateX = 0 이면 맨 왼쪽에 있다고 판정할 수 있다.
      const finalTranslateX = ballContainer.offsetWidth - ball.offsetWidth - 10;

      // 컨테이너 높이 - 공 높이를 계산하면 translate 좌표계에서의 너비를 구할 수 있다. 이 때, CSS-BoxModel로 적용된 border 또한 처리해야되서 10을 빼줬다.
      // 즉, translateY = finalTranslateY면 맨 오른쪽에 닿은거고, translateY = 0이면 맨 왼쪽에 있다고 판정할 수 있다.
      const finalTranslateY =
        ballContainer.offsetHeight - ball.offsetHeight - 10;

      const render = () => {
        // getComputedStyle.getPropertyValue를 찍으면 matrix : [] 형태로 찍힌다.
        // 따라서 matrix 문자열이 포함된 정규식 조건으로 match를 통과시키고, 이 때 나오는 1번째 요소 (배열 내부 값들)을 빼내어 좌표계 값으로 가져온다.
        const transformProperty = getComputedStyle(ball)
          .getPropertyValue("transform")
          .match(/^matrix\((.+)\)$/)?.[1]
          .split(",");

        const [translateXValue, translateYValue] = [
          Number(transformProperty?.[4] ?? 0), // ,로 split했을 때, 4번째가 x좌표에 해당된다.
          Number(transformProperty?.[5] ?? 0), // ,로 split했을 때, 5번째가 y좌표에 해당된다.
        ];

        // 맨 아래에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        if (translateYValue === finalTranslateY) {
          // 경우에 따라 맨 아래에 닿았으면서, 맨 오른쪽에 닿았을 수도 있다. 이 때는 좌상단 대각으로 방향을 정한다.
          if (translateXValue === finalTranslateX) {
            vector = "topLeft";
          }
          // 경우에 따라 맨 아래에 닿았으면서, 맨 왼쪽에 닿았을 수도 있다. 이 때는 우상단 대각으로 방향을 정한다.
          if (!translateXValue) {
            vector = "topRight";
          }

          if (vector === "botRight") {
            vector = "topRight";
          }

          if (vector === "botLeft") {
            vector = "topLeft";
          }
        }
        // 맨 위에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        if (!translateYValue) {
          // 경우에 따라 맨 위에 닿았으면서, 맨 오른쪽에 닿았을 수도 있다. 이 때는 좌하단 대각으로 방향을 정한다.
          if (translateXValue === finalTranslateX) {
            vector = "botLeft";
          }
          // 경우에 따라 맨 위에 닿았으면서, 맨 왼쪽에 닿았을 수도 있다. 이 때는 우하단 대각으로 방향을 정한다.
          if (!translateXValue) {
            vector = "botRight";
          }

          if (vector === "topRight") {
            vector = "botRight";
          }

          if (vector === "topLeft") {
            vector = "botLeft";
          }
        }
        // 오른쪽 끝에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        // 이미 맨 위 / 맨 아래에 닿았을 때의 조건을 상단 if문에서 처리했으니 여기에선 처리할 이유가 없다.
        if (translateXValue === finalTranslateX) {
          if (vector === "topRight") {
            vector = "topLeft";
          }

          if (vector === "botRight") {
            vector = "botLeft";
          }
        }
        // 왼쪽 끝에 닿으면 닿기 전에 공이 튀기던 방향을 확인해서 다음 방향을 정해준다.
        // 이미 맨 위 / 맨 아래에 닿았을 때의 조건을 상단 if문에서 처리했으니 여기에선 처리할 이유가 없다.
        if (!translateXValue) {
          if (vector === "topLeft") {
            vector = "topRight";
          }

          if (vector === "botLeft") {
            vector = "botRight";
          }
        }

        ball.style.transform = `translate(${
          translateXValue + 1 * (vector.includes("Right") ? 1 : -1) + "px"
        },${translateYValue + 1 * (vector.includes("bot") ? 1 : -1) + "px"})`;

        rafId = requestAnimationFrame(render);
      };

      requestAnimationFrame(render);
    };

    // intervalBallAnimate();
    frameBallAnimate();

    return () => {
      // clearInterval(intervalTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <BallContainer ref={ballContainerRef}>
      <Ball ref={ballRef} />
    </BallContainer>
  );
}

const BallContainer = styled.div`
  position: absolute;
  top: calc(75% - 50vh);
  left: calc(75% - 50vw);
  width: 600px;
  height: 50vh;
  border: 5px solid #777;
`;

const Ball = styled.div`
  position: relative;
  width: 70px;
  height: 80px;
  border: 3px solid #dd9bca;
  border-radius: 50%;
`;
