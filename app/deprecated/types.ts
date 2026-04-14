export type DispatchArea = {
  Dispatch_ID: number
  DispatchName: string
  FDRA_ID: number
}

export type FDRARecord = {
  FDRA_ID: number
  FDRAname: string
  BI: number
  ERC: number
  [key: string]: any
}
