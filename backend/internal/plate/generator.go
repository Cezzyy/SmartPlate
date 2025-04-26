package plate

import (
	"fmt"
	"math/rand"
	"strconv"
	"time"
)

// Region prefixes mapping
var regionPrefixes = map[string]string{
	"NCR":             "A",
	"CALABARZON":      "B",
	"CENTRAL_LUZON":   "C",
	"WESTERN_VISAYAS": "D",
	"CENTRAL_VISAYAS": "E",
	"EASTERN_VISAYAS": "F",
	"NORTHERN_MINDANAO": "G",
	"SOUTHERN_MINDANAO": "H",
	"CAR":              "J",
	"CARAGA":           "K",
	"BICOL":            "L",
	"ILOCOS":           "M",
	"MIMAROPA":         "N",
	"SOCCSKSARGEN":     "P",
	"ZAMBOANGA":        "R",
	"BARMM":            "S",
}

const lettersPool = "ABCDEFGHJKLMNPRSTUVWXYZ"

func init() {
	// seed once when package is imported
	rand.Seed(time.Now().UnixNano())
}

// GeneratePlateNumber returns a Philippine-style plate based on vehicleType, plateType and region.
func GeneratePlateNumber(vehicleType, plateType, region string) string {
	pref, ok := regionPrefixes[region]
	if !ok {
		pref = regionPrefixes["NCR"]
	}

	// special case: motorcycle
	if vehicleType == "2-Wheel" {
		num := rand.Intn(9000) + 1000 // 1000–9999
		if rand.Float64() > 0.5 {
			// L-NNN
			return fmt.Sprintf("%s-%s", pref, strconv.Itoa(num)[:3])
		}
		// LL-NNNNN
		sec := lettersPool[rand.Intn(len(lettersPool))]
		five := rand.Intn(90000) + 10000
		return fmt.Sprintf("%s%c-%d", pref, sec, five)
	}

	// 4-wheelers
	var L2, L3 string
	switch plateType {
	case "Diplomatic":
		codes := []string{"USA", "JPN", "KOR", "CHN", "GBR", "AUS"}
		cc := codes[rand.Intn(len(codes))]
		return fmt.Sprintf("%s-%d", cc, rand.Intn(9000)+1000)
	case "Government":
		L2 = "S"
		L3 = string(lettersPool[rand.Intn(len(lettersPool))])
	case "Electric":
		a2 := "ABCDEFGHJKLM"
		L2 = string(a2[rand.Intn(len(a2))])
		L3 = string("VWXYZ"[rand.Intn(5)])
	case "Hybrid":
		h2 := "NPRSTUVWXYZ"
		L2 = string(h2[rand.Intn(len(h2))])
		L3 = string("VWXYZ"[rand.Intn(5)])
	case "Trailer":
		L2 = "U"
		L3 = string(lettersPool[rand.Intn(len(lettersPool))])
	case "Vintage":
		L2 = string(lettersPool[rand.Intn(len(lettersPool))])
		sufs := []string{"TX", "TY", "TZ"}
		L3 = sufs[rand.Intn(len(sufs))]
	case "For Hire", "PublicUtility":
		L2 = string(lettersPool[rand.Intn(len(lettersPool))])
		L3 = string(lettersPool[rand.Intn(len(lettersPool))])
	default: // Private
		L2 = string(lettersPool[rand.Intn(len(lettersPool))])
		L3 = string(lettersPool[rand.Intn(len(lettersPool))])
	}

	seq := rand.Intn(9000) + 1000
	return fmt.Sprintf("%s%s%s %d", pref, L2, L3, seq)
}
