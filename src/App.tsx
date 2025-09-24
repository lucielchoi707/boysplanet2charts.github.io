import { useEffect, useMemo, useState } from "react";
import { traineesData } from "../trainees";
import { RankingChart } from "./components/ranking-chart";
import { ITraineeInfo } from "./types";
import bpLogo from "./assets/boys-planet2-logo.png";
import { useWindowDimensions } from "./hooks/useWindowDimensions";
import { Footer } from "./components/Footer";
import { BiSearchAlt, BiLinkExternal } from "react-icons/bi";
import { RiWeiboFill } from "react-icons/ri";
import { MdStars } from "react-icons/md";
import { BsArrowRightShort } from "react-icons/bs";
import * as amplitude from "@amplitude/analytics-browser";

// const LATEST_EP_WITH_RANKINGS = "ep5";
type EpisodeKey =
  | "ep1"
  | "ep2"
  | "ep3"
  | "ep5"
  | "ep7"
  | "ep8"
  | "ep9"
  | "ep10";
const LATEST_EP_WITH_RANKINGS: EpisodeKey = "ep10";

// Inline extension type instead of ITraineeInfoWithImage
type TraineeWithImage = ITraineeInfo & { image: string };

function App() {
  const { isMobileOrTablet } = useWindowDimensions();

  useEffect(() => {
    amplitude.init(import.meta.env.VITE_AMPLITUDE_KEY);
  }, []);

  // Precompute image once and keep using currentTrainee.image
  const addImgToTraineeArray = (
    trainees: ITraineeInfo[]
  ): TraineeWithImage[] => {
    return trainees.map((trainee) => ({
      ...trainee,
      image: new URL(
        `./assets/trainees-jpeg/${trainee.imagefile}`,
        import.meta.url
      ).href,
    }));
  };

  const renderTraineeEmojiAccordingToRank = (rank: number) => {
    if (rank === 1) return "👑";
    if (rank > 1 && rank < 10) return "⭐";
    return "";
  };

  const traineesSortedByMostRecentRank = useMemo(() => {
    const survivedTrainees = traineesData
      .filter((t) => t[LATEST_EP_WITH_RANKINGS] !== -1)
      .sort((a, b) => a[LATEST_EP_WITH_RANKINGS] - b[LATEST_EP_WITH_RANKINGS]);

    // EP5 eliminated: didn’t receive a rank in EP5
    const ep5eliminatedTrainees = traineesData
      .filter((t) => t.ep7 === -1)
      .sort((a, b) => (a.name > b.name ? 1 : -1)); // or by agency, etc.
    // EP8 eliminated: didn’t receive a rank in EP9 [Update in next episode]
    const ep8eliminatedTrainees = traineesData
      .filter((t) => t.ep9 === -1)
      .sort((a, b) => (a.name > b.name ? 1 : -1)); // or by agency, etc.
    const ep10eliminatedTrainees = traineesData
      .filter((t) => t.ep10 === -1)
      .sort((a, b) => (a.name > b.name ? 1 : -1)); // or by agency, etc.
    return [
      ...survivedTrainees,
      ...ep5eliminatedTrainees,
      ...ep8eliminatedTrainees,
      ...ep10eliminatedTrainees,
    ];
  }, [traineesData]);

  // Attach image once to the sorted list
  const traineesWithImage: TraineeWithImage[] = useMemo(
    () => addImgToTraineeArray(traineesSortedByMostRecentRank),
    [traineesSortedByMostRecentRank]
  );

  const [currentTrainee, setCurrentTrainee] = useState<TraineeWithImage>(
    traineesWithImage[0]
  );
  const [filteredTrainees, setFilteredTrainees] =
    useState<TraineeWithImage[]>(traineesWithImage);

  const generateRankDifference = (rank1: number, rank2: number) => {
    const isRankUnavailable = rank2 === -1;
    const difference = rank1 - rank2;
    const noDifference = difference === 0;
    const higher = difference > 0;

    if (isRankUnavailable) return "";
    if (noDifference) {
      return <p style={{ color: "#9eada3", fontSize: 14 }}>{`(-) `}</p>;
    }
    if (higher) {
      return (
        <p style={{ color: "#37f075", fontSize: 14 }}>{`(▲ ${difference})`}</p>
      );
    }
    return (
      <p style={{ color: "#fc1c03", fontSize: 14 }}>{`(▼ ${difference})`}</p>
    );
  };

  const handleSearchTrainee = (input: string) => {
    const formattedInput = input.replace(" ", "").toLowerCase();
    if (formattedInput) {
      const newTrainees = traineesWithImage.filter((trainee) => {
        const formattedTraineeName = trainee.name
          .replace(/\s/g, "")
          .toLowerCase();
        return formattedTraineeName.includes(formattedInput);
      });
      setFilteredTrainees(newTrainees);
    } else {
      setFilteredTrainees(traineesWithImage);
    }
  };

  const TRAINEE_RANK_ARRAY = useMemo(
    () => [
      currentTrainee.ep1,
      currentTrainee.ep2,
      currentTrainee.ep3,
      -1,
      currentTrainee.ep5,
      -1,
      currentTrainee.ep7,
      currentTrainee.ep8,
      currentTrainee.ep9,
      currentTrainee.ep10,
      // -1,
      // currentTrainee.ep11,
      // currentTrainee.ep12,
    ],
    [currentTrainee]
  );

  const handleClickTraineeRow = (trainee: TraineeWithImage) => {
    setCurrentTrainee(trainee);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  const handleMouseEnterTraineeRow = (trainee: TraineeWithImage) => {
    !isMobileOrTablet && setCurrentTrainee(trainee);
    amplitude.track("Trainee Row Mouse Enter", trainee);
  };

  const generateTraineeStarRanks = (
    rank1?: number,
    rank2?: number,
    rank5?: number,
    rank7?: number,
    rank8?: number,
    isC?: boolean
  ) => {
    const iconColor = isC ? "#e6497c" : "#383d9e";

    // normalize: -1 or undefined/null = missing, else number
    const normalize = (v?: number) => (v == null || v === -1 ? null : v);

    const steps = [
      normalize(rank1),
      normalize(rank2),
      normalize(rank5),
      normalize(rank7),
      normalize(rank8),
    ].filter((v) => v !== null); // drop missing stages completely

    if (steps.length === 0) return null;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingBottom: 20,
        }}
      >
        {steps.map((n, i) => (
          <span
            key={i}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {n === 0 ? (
              <strong
                style={{
                  color: iconColor,
                  fontSize: isMobileOrTablet ? 12 : 16,
                }}
              >
                0 STAR
              </strong>
            ) : (
              Array(n)
                .fill(0)
                .map((_, j) => <MdStars key={j} size={18} color={iconColor} />)
            )}
            {i < steps.length - 1 && <BsArrowRightShort size={18} />}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "150px",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "20vh",
          minHeight: "120px",
          width: "100%",
          backgroundColor: "#070707ff",
          background:
            "radial-gradient(ellipse at bottom, #000000 0%, #0a0a0a 100%)",
          position: "relative",
          overflow: "visible",
        }}
      >
        {/* Stars Layer */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              'transparent url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="10" cy="10" r="1" fill="white" /><circle cx="50" cy="70" r="1" fill="white" /><circle cx="80" cy="20" r="1" fill="white" /></svg>\') repeat',
            opacity: 0.5,
            pointerEvents: "none",
          }}
        />
        <img key={currentTrainee.name} style={{ height: "75%" }} src={bpLogo} />
      </div>

      <div
        style={{
          flexDirection: isMobileOrTablet ? "column" : "row",
          display: "flex",
          flex: 1,
          paddingTop: 32,
          width: "100%",
        }}
      >
        <div style={{ flex: 1 }}>
          <RankingChart
            rankings={TRAINEE_RANK_ARRAY}
            isGlobal={currentTrainee.group === "C"}
          />

          <div
            className="trainee_card"
            style={{
              boxShadow: `0px 0px 29px 5px ${
                currentTrainee.group === "K" ? "#7fcbeb3d" : "#dc7cb03d"
              }`,
            }}
          >
            <div style={{ width: "100%" }}>
              <div
                style={{
                  flexDirection: "row",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    margin: 0,
                    padding: 0,
                    fontSize: isMobileOrTablet ? 16 : 20,
                  }}
                >
                  {currentTrainee.name}
                </p>
                <div
                  style={{
                    backgroundColor:
                      currentTrainee.group === "C" ? "#dc7cb0" : "#7fcaeb",
                  }}
                  className="trainee_group_circle"
                >
                  <p>{currentTrainee.group}</p>
                </div>
                <p>
                  {renderTraineeEmojiAccordingToRank(
                    currentTrainee[
                      LATEST_EP_WITH_RANKINGS as keyof ITraineeInfo
                    ] as number
                  )}
                </p>
                <div
                  style={{
                    display: "flex",
                    flex: 1,
                    justifyContent: "flex-end",
                    gap: 10,
                  }}
                >
                  <a
                    href={currentTrainee.profileurl}
                    target="_blank"
                    onClick={() =>
                      amplitude.track(
                        "Trainee Mnet Profile Clicked",
                        currentTrainee
                      )
                    }
                  >
                    <BiLinkExternal
                      size={isMobileOrTablet ? 18 : 24}
                      className="external_link_icon"
                    />
                  </a>
                </div>
              </div>

              {generateTraineeStarRanks(
                currentTrainee?.star_rank1,
                currentTrainee?.star_rank2,
                currentTrainee?.star_rank5,
                currentTrainee?.star_rank7,
                currentTrainee?.star_rank8,
                currentTrainee.group === "C"
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingBottom: 16,
                }}
              >
                <p
                  style={{
                    width: "70%",
                    textAlign: "center",
                    fontSize: isMobileOrTablet ? 10 : 15,
                  }}
                >
                  <em>"{currentTrainee.subheading}"</em>
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <div>
                  <img
                    style={{
                      borderRadius: 10,
                      width: isMobileOrTablet ? "5rem" : "12rem",
                    }}
                    src={currentTrainee.image}
                  />
                </div>
                <div className="trainee_card_column">
                  <p style={{ fontSize: isMobileOrTablet ? 11 : 16 }}>
                    <b style={{ color: "#5a5a5a" }}>Birthdate:</b>{" "}
                    {currentTrainee.birthday}
                  </p>
                  <p style={{ fontSize: isMobileOrTablet ? 11 : 16 }}>
                    <b style={{ color: "#5a5a5a" }}>Height:</b>{" "}
                    {currentTrainee.height}cm
                  </p>
                  <p style={{ fontSize: isMobileOrTablet ? 11 : 16 }}>
                    <b style={{ color: "#5a5a5a" }}>Hobby:</b>{" "}
                    {currentTrainee.hobby}
                  </p>
                  <p style={{ fontSize: isMobileOrTablet ? 11 : 16 }}>
                    <b style={{ color: "#5a5a5a" }}>Specialty:</b>{" "}
                    {currentTrainee.specialty}
                  </p>
                  {currentTrainee.eliminated_ep !== -1 && (
                    <p style={{ fontSize: isMobileOrTablet ? 11 : 16 }}>
                      <b style={{ color: "#5a5a5a" }}>Eliminated in EP:</b>{" "}
                      {currentTrainee.eliminated_ep}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 24,
            flex: 1,
          }}
        >
          <div className="search_bar_container">
            <div className="search_bar">
              <div className="pop-in" style={{ display: "flex" }}>
                <BiSearchAlt color="#b4b4b4" />
              </div>
              <input
                className="search_bar_input"
                type="text"
                onChange={(evt) => handleSearchTrainee(evt.target.value)}
                placeholder="Search for your trainee!"
              />
            </div>
          </div>

          <div className="fixed_header">
            <table>
              <div className="fade_div" />
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>GROUP</th>
                  <th>COMPANY</th>
                  <th>EP 1</th>
                  <th>EP 2</th>
                  <th>EP 3</th>
                  <th>EP 5</th>
                  <th>EP 7</th>
                  <th>EP 8</th>
                  <th>EP 9</th>
                  <th>EP 10</th>
                  {/*
                  <th>EP 11</th>
                  <th>EP 12</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredTrainees.map((item) => (
                  <tr
                    onMouseEnter={() => handleMouseEnterTraineeRow(item)}
                    onClick={() => handleClickTraineeRow(item)}
                    key={item.name}
                    style={{
                      position: "relative",
                      zIndex:
                        item[LATEST_EP_WITH_RANKINGS as keyof ITraineeInfo] ===
                        93
                          ? 1
                          : "inherit",
                    }}
                  >
                    <td>
                      {renderTraineeEmojiAccordingToRank(
                        item[
                          LATEST_EP_WITH_RANKINGS as keyof ITraineeInfo
                        ] as number
                      )}{" "}
                      {item.name}
                    </td>
                    <td>{item.group}</td>
                    <td>{item.agency}</td>
                    <td>{item.ep1}</td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep1, item.ep2)}
                        <p>{item.ep2}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep2, item.ep3)}
                        <p>{item.ep3 === -1 ? "-" : item.ep3}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep3, item.ep5)}
                        <p>{item.ep5 === -1 ? "-" : item.ep5}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep5, item.ep7)}
                        <p>{item.ep7 === -1 ? "-" : item.ep7}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep7, item.ep8)}
                        <p>{item.ep8 === -1 ? "-" : item.ep8}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep8, item.ep9)}
                        <p>{item.ep9 === -1 ? "-" : item.ep9}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {generateRankDifference(item.ep9, item.ep10)}
                        <p>{item.ep10 === -1 ? "-" : item.ep10}</p>
                      </div>
                    </td>
                    {/*
                    <td>
                      <div className="ranking_div">
                        {item.ep9 !== -1 &&
                          generateRankDifference(item.ep8, item.ep9)}
                        <p>{item.ep9 === -1 ? "-" : item.ep9}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {item.ep11 !== -1 &&
                          generateRankDifference(
                            item.ep9 !== -1 ? item.ep9 : item.ep8,
                            item.ep11
                          )}
                        <p>{item.ep11 === -1 ? "-" : item.ep11}</p>
                      </div>
                    </td>
                    <td>
                      <div className="ranking_div">
                        {item.ep12 !== -1 &&
                          generateRankDifference(item.ep11, item.ep12)}
                        <p>{item.ep12 === -1 ? "-" : item.ep12}</p>
                      </div>
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
