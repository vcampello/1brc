package config

import (
	"flag"
	"runtime"
)

type Config struct {
	Filepath string
	Silent   bool
	Threads  int
}

func ParseCliFlags() *Config {
	filepath := flag.String("file", "measurements.txt", "specify the weather station file")
	threads := flag.Int("threads", runtime.NumCPU(), "number of threads (will be overridden if there are not enough lines)")
	silent := flag.Bool("silent", true, "only display the output")

	flag.Parse()

	return &Config{
		Filepath: *filepath,
		Threads:  *threads,
		Silent:   *silent,
	}

}
