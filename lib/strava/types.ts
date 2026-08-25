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

  sex?: "M" | "F" | null;

  profile_medium?: string | null;

  profile?: string | null;

  premium?: boolean;

  summit?: boolean;

  created_at?: string | null;

  updated_at?: string | null;
}

/* -------------------------------------------------------------------------- */
/* Athlete Summary                                                            */
/* -------------------------------------------------------------------------- */

export interface StravaAthleteSummary {
  id: number;

  username?: string | null;

  firstname?: string | null;

  lastname?: string | null;

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
/* Gear                                                                       */
/* -------------------------------------------------------------------------- */

export interface StravaGear 
{
  id: string;
  name?: string | null;
  primary?: boolean | null;
  resource_state?: number | null;
  distance?: number | null;
  brand_name?: string | null;
  model_name?: string | null;
  description?: string | null;
  frame_type?: number | null;
}

/* -------------------------------------------------------------------------- */
/* Activity                                                                    */
/* -------------------------------------------------------------------------- */

export interface StravaActivity {
  /* ------------------------------------------------------------------------ */
  /* Basic                                                                     */
  /* ------------------------------------------------------------------------ */

  id: number;

  name: string;

  type: string;

  sport_type?: string | null;

  resource_state?: number | null;

  /* ------------------------------------------------------------------------ */
  /* Athlete                                                                   */
  /* ------------------------------------------------------------------------ */

  athlete?: StravaAthleteSummary | null;

  /* ------------------------------------------------------------------------ */
  /* Date / Time                                                               */
  /* ------------------------------------------------------------------------ */

  start_date: string;

  start_date_local: string;

  timezone?: string | null;

  /* ------------------------------------------------------------------------ */
  /* Distance / Duration                                                       */
  /* ------------------------------------------------------------------------ */

  distance: number;

  moving_time: number;

  elapsed_time: number;

  total_elevation_gain: number;

  elev_high?: number | null;

  elev_low?: number | null;

  /* ------------------------------------------------------------------------ */
  /* Speed                                                                     */
  /* ------------------------------------------------------------------------ */

  average_speed: number;

  max_speed?: number | null;

  average_cadence?: number | null;

  max_cadence?: number | null;

  /* ------------------------------------------------------------------------ */
  /* Heart Rate                                                               */
  /* ------------------------------------------------------------------------ */

  average_heartrate?: number | null;

  max_heartrate?: number | null;

  has_heartrate?: boolean;

  /* ------------------------------------------------------------------------ */
  /* Power                                                                     */
  /* ------------------------------------------------------------------------ */

  average_watts?: number | null;

  max_watts?: number | null;

  weighted_average_watts?: number | null;

  kilojoules?: number | null;

  /* ------------------------------------------------------------------------ */
  /* Calories                                                                  */
  /* ------------------------------------------------------------------------ */

  calories?: number | null;

  /* ------------------------------------------------------------------------ */
  /* GPS                                                                       */
  /* ------------------------------------------------------------------------ */

  start_latlng?: [number, number] | null;

  end_latlng?: [number, number] | null;

  map?: {
    id?: string | null;

    summary_polyline?: string | null;

    resource_state?: number | null;
  } | null;

  /* ------------------------------------------------------------------------ */
  /* Device                                                                    */
  /* ------------------------------------------------------------------------ */

  /**
   * Device used to record the activity.
   *
   * Example:
   */
  device_name?: string | null;

  /* ------------------------------------------------------------------------ */
  /* Gear                                                                      */
  /* ------------------------------------------------------------------------ */

  /**
   * Strava gear ID.
   *
   * Example:
   * "g12345678"
   */
  gear_id?: string | null;

  gear?: StravaGear | null;

  /* ------------------------------------------------------------------------ */
  /* Activity Options                                                          */
  /* ------------------------------------------------------------------------ */

  trainer?: boolean;

  commute?: boolean;

  manual?: boolean;

  private?: boolean;

  flagged?: boolean;

  /* ------------------------------------------------------------------------ */
  /* Social                                                                    */
  /* ------------------------------------------------------------------------ */

  achievement_count?: number;

  kudos_count?: number;

  comment_count?: number;

  athlete_count?: number;

  photo_count?: number;

  total_photo_count?: number;

  /* ------------------------------------------------------------------------ */
  /* Description                                                               */
  /* ------------------------------------------------------------------------ */

  description?: string | null;

  /* ------------------------------------------------------------------------ */
  /* Best Efforts                                                              */
  /* ------------------------------------------------------------------------ */

  best_efforts?: StravaBestEffort[];

  /* ------------------------------------------------------------------------ */
  /* Workout                                                                   */
  /* ------------------------------------------------------------------------ */

  workout_type?: number | null;

  perceived_exertion?: number | null;

  suffer_score?: number | null;
}

/* -------------------------------------------------------------------------- */
/* Activity Streams                                                           */
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

/* -------------------------------------------------------------------------- */
/* Activity Streams                                                           */
/* -------------------------------------------------------------------------- */

export interface StravaActivityStreams {
  time?: StravaStream;

  distance?: StravaStream;

  latlng?: StravaStream;

  altitude?: StravaStream;

  velocity_smooth?: StravaStream;

  heartrate?: StravaStream;

  cadence?: StravaStream;

  watts?: StravaStream;

  grade_smooth?: StravaStream;

  moving?: StravaStream;

  temp?: StravaStream;

  grade_adjusted_distance?: StravaStream;
}

/* -------------------------------------------------------------------------- */
/* Stream Set                                                                 */
/* -------------------------------------------------------------------------- */

export type StravaStreamSet = Record<
  string,
  StravaStream
>;

/* -------------------------------------------------------------------------- */
/* Activity Totals                                                            */
/* -------------------------------------------------------------------------- */

export interface StravaActivityTotals {
  count?: number;

  distance?: number;

  moving_time?: number;

  elapsed_time?: number;

  elevation_gain?: number;

  achievement_count?: number;
}

/* -------------------------------------------------------------------------- */
/* Athlete Stats                                                              */
/* -------------------------------------------------------------------------- */

export interface StravaAthleteStats {
  biggest_ride_distance?: number;

  biggest_climb_elevation_gain?: number;

  recent_ride_totals?: StravaActivityTotals;

  recent_run_totals?: StravaActivityTotals;

  recent_swim_totals?: StravaActivityTotals;

  ytd_ride_totals?: StravaActivityTotals;

  ytd_run_totals?: StravaActivityTotals;

  ytd_swim_totals?: StravaActivityTotals;

  all_ride_totals?: StravaActivityTotals;

  all_run_totals?: StravaActivityTotals;

  all_swim_totals?: StravaActivityTotals;
}