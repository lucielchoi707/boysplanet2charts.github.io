export interface ITraineeInfo {
  name: string;
  nickname: string;
  subheading: string;
  birthday: string;
  height: number;
  profileurl: string;
  imagefile: string;
  agency: string;
  hobby: string ;
  specialty: string ;
  name1: string;
  kc_name: string ;
  group: string ;
  star_rank1: number ;
  ep1: number ;
  ep2: number ;
  star_rank2: number ;
  ep3_master: number ;
  ep3: number ;
  ep5: number ;
// NOTE: EP6–EP12 are not out yet; keep them nullable and don’t use them in UI
  ep6: number | null;
  ep8: number | null;
  ep9: number | null;
  ep11: number | null;
  ep12: number | null;
  eliminated_ep: number | null;
}

