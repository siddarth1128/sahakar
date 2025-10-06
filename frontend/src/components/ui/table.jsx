import * as React from "react"
import { cn } from "../../lib/utils"

// Presentational table components compatible with manual children usage

const Table = ({ className, ...props }) => (
  <div className="w-full">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
)

const TableHeader = ({ className, ...props }) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props} />
)

const TableBody = ({ className, ...props }) => (
  <tbody className={cn("bg-background font-normal text-foreground", className)} {...props} />
)

const TableRow = ({ className, ...props }) => (
  <tr className={cn("border-b transition-colors", className)} {...props} />
)

const TableHead = ({ className, ...props }) => (
  <th
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
)

const TableCell = ({ className, ...props }) => (
  <td className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)} {...props} />
)

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell }
