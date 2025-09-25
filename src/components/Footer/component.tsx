import "./styles.css";
import { BR } from "country-flag-icons/react/3x2";

export const Footer = () => {
  return (
    <div className="footer_div">
      <p style={{ fontWeight: "bold", fontSize: 9 }}>
        Inspired by:{" "}
        <a target="_blank" href="https://p101s2.github.io/">
          Produce 101 Season 2 Rankings
        </a>{" "}
        and{" "}
        <a target="_blank" href="https://boysplanetranking.netlify.app//">
          Boys Planet Rankings
        </a>
      </p>
      <p style={{ fontWeight: "bold", fontSize: 9 }}>
        Contribute to the project on{" "}
        <a
          target="_blank"
          href="https://github.com/lucielchoi707/boysplanet2charts.github.io"
        >
          Github
        </a>
      </p>
      <p style={{ fontWeight: "bold", fontSize: 9, textAlign: "center" }}>
        If you find any errors or inaccuracies, you can open issue on{" "}
        <a
          target="_blank"
          href="https://github.com/lucielchoi707/boysplanet2charts.github.io"
        >
          Github
        </a>
      </p>
    </div>
  );
};
