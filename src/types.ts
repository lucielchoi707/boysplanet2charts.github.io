export interface ITraineeInfo {
  name: string | null;
  nickname: string | null;
  subheading: string | null;
  birthday: string | null;
  height: number | null;
  profileurl: string | null;
  imagefile: string | null;
  agency: string | null;
  hobby: string | null;
  specialty: string | null;
  name1: string | null;
  kc_name: string | null;
  group: string | null;
  star_rank1: number | null;
  ep1: number | null;
  ep2: number | null;
  star_rank2: number | null;
  ep3_master: number | null;
  ep3: number | null;
  ep5: number | null;
  ep6: number | null;
  ep8: number | null;
  ep9: number | null;
  ep11: number | null;
  ep12: number | null;
  eliminated_ep: number | null;
}

export interface ITraineeInfoWithImage extends ITraineeInfo {
  image: string;
}
