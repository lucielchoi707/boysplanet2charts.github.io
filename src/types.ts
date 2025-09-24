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
  star_rank5: number;
  ep7: number;
  star_rank7: number;
  ep8: number;
  star_rank8: number;
  ep9: number;
  ep10: number;
  // NOTE: EP9–EP10 are not out yet; keep them nullable and don’t use them in UI
  ep11: number | null;
  eliminated_ep: number | null;
}

