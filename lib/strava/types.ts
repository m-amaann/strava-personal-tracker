/* -------------------------------------------------------------------------- */
/* Athlete                                                                    */
/* -------------------------------------------------------------------------- */

export interface StravaAthlete {
  id: number;

  username?: string | null;

  firstname?: string | null;

  lastname?: string | null;

  city?: string | null;

  state?: string | null;

  country?: string | null;

  profile_medium?: string | null;

  profile?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Best Effort                                                                */
/* -------------------------------------------------------------------------- */

export interface StravaBestEffort {
  id?: number;

  name: string;

  elapsed_time: number;

  moving_time: number;

  start_date?: string;

  start_date_local?: string;

  distance?: number;

  pr_rank?: number | null;

  average_heartrate?: number | null;

  average_cadence?: number | null;
}


/* -------------------------------------------------------------------------- */
/* Activity                                                                    */
/* -------------------------------------------------------------------------- */

export interface StravaActivity {
  id: number;

  name: string;

  type: string;

  sport_type?: string | null;

  trainer?: boolean;

  start_date: string;

  start_date_local: string;

  distance: number;

  moving_time: number;

  elapsed_time: number;

  total_elevation_gain: number;

  average_speed: number;

  max_speed?: number | null;

  average_heartrate?: number | null;

  max_heartrate?: number | null;

  average_cadence?: number | null;

  calories?: number | null;

  best_efforts?: StravaBestEffort[];

  map?: {
    id?: string | null;

    summary_polyline?: string | null;

    resource_state?: number;
  } | null;
}



/* -------------------------------------------------------------------------- */
/* Activity Streams                                                            */
/* -------------------------------------------------------------------------- */


export interface StravaStream {
  type: string;

  data:
    | number[]
    | Array<[number, number]>;

  series_type?: string;

  original_size?: number;

  resolution?: string;
}


export interface StravaActivityStreams {
  time?: StravaStream;

  distance?: StravaStream;

  latlng?: StravaStream;

  altitude?: StravaStream;

  velocity_smooth?: StravaStream;

  heartrate?: StravaStream;

  cadence?: StravaStream;
}

export type StravaStreamSet = Record<string, StravaStream>;


