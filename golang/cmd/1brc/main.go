package main

import (
	"bufio"
	"fmt"
	"io"
	"log"
	"os"
	"strconv"

	"github.com/vcampello/1brc/golang/internal/bench"
	"github.com/vcampello/1brc/golang/internal/config"
	"github.com/vcampello/1brc/golang/internal/stats"
)

func main() {
	duration := bench.RunVoid(process)
	fmt.Println(duration)
}

func process() {
	config := config.ParseCliFlags()
	fmt.Printf("Config: %+v\n", *config)

	// get file descriptor
	file, err := os.Open(config.Filepath)
	if err != nil {
		log.Fatal(err)
	}

	// handle closing the file
	defer func() {
		if err := file.Close(); err != nil {
			log.Fatal(err)
		}
	}()

	reader := bufio.NewReader(file)

	// state machine to parse lines conditionally
	mode_city := byte(';')
	mode_temp := byte('\n')
	cur_mode := mode_city

	var city string
	var temp float64
	aggregator := stats.NewAggregator()

	for {
		// try to read up to the current delimiter
		section, err := reader.ReadString(cur_mode)

		// handle io errors
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatal(err)
		}

		// decide how to parse it
		switch cur_mode {
		case mode_city:
			// extract the city name such as 'London;'
			city = string(section[:len(section)-1])

			// switch to temperature parser
			cur_mode = mode_temp
		case mode_temp:
			// extract the city temperature such as '-18.3\n'
			temp_string := string(section[:len(section)-1])
			temp, err = strconv.ParseFloat(temp_string, 64)

			if err != nil {
				log.Fatal("Failed to parse temperature: ", err)
			}

			aggregator.RecordStation(city, temp)

			// switch to city parser
			cur_mode = mode_city
		}

	}

	aggregator.PrintOutput()
}
