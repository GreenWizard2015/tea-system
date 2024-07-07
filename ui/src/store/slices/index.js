import { SystemStatusSlice } from "./SystemStatus";
import { UISlice } from "./UI";
import { NotificationsSlice } from "./Notifications";
import { TempSlice } from "./Temp";

const slices = [ SystemStatusSlice, UISlice, NotificationsSlice, TempSlice ];
// export all slices as an object { [sliceName]: slice }
export const ALL_APP_SLICES = slices.reduce((acc, slice) => {
  acc[slice.name] = slice;
  return acc;
}, {});