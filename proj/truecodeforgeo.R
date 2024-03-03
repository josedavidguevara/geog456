library(readr)
library(dplyr)
library(geojsonio)
library(sf)
migdata <- read_csv("Desktop/Spring 2024/GEOG456/proj/migdata.csv")

#remove first row
migdata <- migdata[-1,]

#make columns into ints

migdata<- migdata %>% 
  mutate(across(.cols=4:10, .fns = as.integer))

# codes and coordinates select numeric code and alphacodes
codes_and_coordinates <- read_csv("Desktop/Spring 2024/GEOG456/proj/countries_codes_and_coordinates.csv")

codes_and_coordinates <- codes_and_coordinates %>% 
  select(code= "Numeric code",country= 'Country', alpha3 = 'Alpha-3 code')


key <- full_join(migdata, codes_and_coordinates, by = c("dest_code"="code"))
key <- key %>% 
  select(country, dest_code, alpha3)

migdata_iso <- full_join(migdata, key, by = 'dest_code')

migdata_iso <- migdata_iso %>% 
  filter(!is.na(alpha3))

#result: ORIGINAL DATAFRAME NOW WITH ISO3

#now add to geojson

geo_data <- st_read("~/Desktop/Spring 2024/GEOG456/proj/world-administrative-boundaries.geojson")

geo_complete <- left_join(geo_data, migdata_iso, by = c("iso3" = 'alpha3'))

geo_complete <- geo_complete %>% 
  mutate(across(c('1990', '1995', '2000', '2005', '2010', '2015','2020'),~ifelse(is.na(.), 0, .)))


library(sf)

# Specify the path and name of the GeoJSON file you want to create
output_file_path <- "~/Desktop/Spring 2024/GEOG456/proj/final_0230.geojson"

# Use st_write to save the sf object as a GeoJSON file
st_write(geo_complete, output_file_path, driver = "GeoJSON")


class(geo_complete)

geo_2015 <- geo_complete %>% 
  select(country, '2000')
