/* ============================================================================
 * Strava API Types
 * ========================================================================== */

/* ============================================================================
 * Common
 * ========================================================================== */

export interface StravaLatLng {
  0: number;
  1: number;
}

/* ============================================================================
 * Athlete
 * ========================================================================== */

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

  weight?: number | null;

  resource_state?: number | null;
}

/* ============================================================================
 * Athlete Summary
 * ========================================================================== */

export interface StravaAthleteSummary {
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

  resource_state?: number | null;
}

/* ============================================================================
 * Athlete Stats
 * ========================================================================== */

export interface StravaActivityTotals {
  count?: number;

  distance?: number;

  moving_time?: number;

  elapsed_time?: number;

  elevation_gain?: number;

  achievement_count?: number;
}

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

/* ============================================================================
 * Best Effort
 * ========================================================================== */

export interface StravaBestEffort {
  id?: number;

  resource_state?: number | null;

  name: string;

  elapsed_time: number;

  moving_time: number;

  start_date?: string | null;

  start_date_local?: string | null;

  distance?: number | null;

  pr_rank?: number | null;

  average_heartrate?: number | null;

  average_cadence?: number | null;

  average_speed?: number | null;
}

/* ============================================================================
 * Activity Map
 * ========================================================================== */

export interface StravaActivityMap {
  id?: string | null;

  summary_polyline?: string | null;

  resource_state?: number | null;

  polyline?: string | null;
}

/* ============================================================================
 * Activity Photo
 * ========================================================================== */

export interface StravaPhoto {
  id?: number;

  unique_id?: string;

  urls?: Record<string, string>;

  source?: number;

  caption?: string | null;

  location?: [number, number] | null;
}

/* ============================================================================
 * Gear
 * ========================================================================== */

export interface StravaGear {
  id: string;

  primary?: boolean | null;

  name?: string | null;

  resource_state?: number | null;

  distance?: number | null;

  brand_name?: string | null;

  model_name?: string | null;

  description?: string | null;

  frame_type?: number | null;
}

/* ============================================================================
 * Activity
 * ========================================================================== */

export interface StravaActivity {
  id: number;

  external_id?: string | null;

  upload_id?: number | null;

  name: string;

  type: string;

  sport_type?: string | null;

  resource_state?: number | null;

  athlete?: StravaAthleteSummary | null;

  start_date: string;

  start_date_local: string;

  timezone?: string | null;

  utc_offset?: number | null;

  location_city?: string | null;

  location_state?: string | null;

  location_country?: string | null;

  distance: number;

  moving_time: number;

  elapsed_time: number;

  total_elevation_gain: number;

  elev_high?: number | null;

  elev_low?: number | null;

  start_latlng?: [number, number] | null;

  end_latlng?: [number, number] | null;

  achievement_count?: number;

  kudos_count?: number;

  comment_count?: number;

  athlete_count?: number;

  photo_count?: number;

  total_photo_count?: number;

  map?: StravaActivityMap | null;

  trainer?: boolean;

  commute?: boolean;

  manual?: boolean;

  private?: boolean;

  flagged?: boolean;

  workout_type?: number | null;

  upload_id_str?: string | null;

  average_speed: number;

  max_speed?: number | null;

  average_cadence?: number | null;

  max_cadence?: number | null;

  average_watts?: number | null;

  max_watts?: number | null;

  weighted_average_watts?: number | null;

  kilojoules?: number | null;

  device_watts?: boolean | null;

  has_heartrate?: boolean;

  average_heartrate?: number | null;

  max_heartrate?: number | null;

  suffer_score?: number | null;

  calories?: number | null;

  description?: string | null;

  gear_id?: string | null;

  gear?: StravaGear | null;

  device_name?: string | null;

  embed_token?: string | null;

  photos?: {
    primary?: StravaPhoto | null;
    count?: number;
  } | null;

  segment_efforts?: StravaSegmentEffort[];

  best_efforts?: StravaBestEffort[];

  perceived_exertion?: number | null;

  prefer_perceived_exertion?: boolean | null;

  pr_count?: number | null;

  has_kudoed?: boolean | null;

  hide_from_home?: boolean | null;
}

/* ============================================================================
 * Segment
 * ========================================================================== */

export interface StravaSegment {
  id?: number;

  name?: string;

  activity_type?: string;

  distance?: number;

  average_grade?: number;

  maximum_grade?: number;

  elevation_high?: number;

  elevation_low?: number;

  start_latlng?: [number, number];

  end_latlng?: [number, number];

  climb_category?: number;

  city?: string;

  state?: string;

  country?: string;

  private?: boolean;

  hazardous?: boolean;

  starred?: boolean;

  total_elevation_gain?: number;

  resource_state?: number;
}

/* ============================================================================
 * Segment Effort
 * ========================================================================== */

export interface StravaSegmentEffort {
  id: number;

  resource_state?: number;

  name?: string;

  activity?: {
    id: number;

    resource_state?: number;
  } | null;

  athlete?: StravaAthleteSummary | null;

  elapsed_time?: number;

  moving_time?: number;

  start_date?: string;

  start_date_local?: string;

  distance?: number;

  start_index?: number;

  end_index?: number;

  average_cadence?: number | null;

  device_watts?: boolean | null;

  average_watts?: number | null;

  pr_rank?: number | null;

  hidden?: boolean;

  segment?: StravaSegment | null;
}

/* ============================================================================
 * Activity Streams
 * ========================================================================== */

export type StravaStreamData =
  | number[]
  | boolean[]
  | string[]
  | Array<[number, number]>;

export interface StravaStream {
  type: string;

  data: StravaStreamData;

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

  watts?: StravaStream;

  temp?: StravaStream;

  moving?: StravaStream;

  grade_smooth?: StravaStream;

  grade_adjusted_distance?: StravaStream;

  distance_stream?: StravaStream;
}

/* ============================================================================
 * Stream Set
 * ========================================================================== */

export type StravaStreamSet =
  Record<string, StravaStream>;

/* ============================================================================
 * Heart Rate Zones
 * ========================================================================== */

export interface StravaZoneRange {
  min: number;

  max: number;
}

export interface StravaHeartRateZoneRanges {
  custom_zones: boolean;

  zones: StravaZoneRange[];
}

export interface StravaPowerZoneRanges {
  custom_zones?: boolean;

  zones?: StravaZoneRange[];
}

export interface StravaAthleteZones {
  heart_rate?: StravaHeartRateZoneRanges;

  power?: StravaPowerZoneRanges;
}

/* ============================================================================
 * Activity Zones
 * ========================================================================== */

export interface StravaTimedZoneRange {
  min: number;

  max: number;

  time: number;
}

export interface StravaActivityZone {
  score?: number;

  distribution_buckets?: StravaTimedZoneRange[];

  type:
    | "heartrate"
    | "power"
    | string;

  sensor_based?: boolean;

  points?: number;

  custom_zones?: boolean;

  max?: number;
}

/* ============================================================================
 * Running Equipment
 * ========================================================================== */

export interface StravaEquipment {
  watch: {
    name: string;

    status?: string;
  } | null;

  shoes: {
    id?: string;

    name: string;

    status?: string;

    distance?: number;

    brand_name?: string | null;

    model_name?: string | null;
  }[];

  dataSources: {
    name: string;

    status?: string;
  }[];
}

/* ============================================================================
 * OAuth Token Response
 * ========================================================================== */

export interface StravaTokenResponse {
  token_type?: string;

  access_token: string;

  refresh_token: string;

  expires_at: number;

  expires_in?: number;

  athlete?: StravaAthlete;

  scope?: string;
}

/* ============================================================================
 * API Error
 * ========================================================================== */

export interface StravaApiError {
  message?: string;

  errors?: {
    resource?: string;

    field?: string;

    code?: string;
  }[];
}

/* ============================================================================
 * Generic API Response
 * ========================================================================== */

export interface StravaApiResponse<T> {
  data: T;

  connected?: boolean;

  error?: string;
}