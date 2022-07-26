import argparse
import csv

def get_formatted_csv_rows(file_name):
    data = []

    with open(file_name, 'r', newline='', encoding='utf-8') as f:
        csv_reader = csv.reader(f, skipinitialspace=True)
        for row in csv_reader:
            data.append(row)

    return data

def write_csv_rows(file_name, rows):
    with open(file_name, 'w', newline='') as f:
        csv_writer = csv.writer(f)
        csv_writer.writerows(rows)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("infile", help="enter a csv file to format")
    parser.add_argument("outfile", help="enter a file name to to output formatted csv")
    args = parser.parse_args()

    formatted_rows = get_formatted_csv_rows(args.infile)
    write_csv_rows(args.outfile, formatted_rows)

if __name__ == "__main__":
    main()