import { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Line,
  Legend,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
// @ts-ignore
import data from '../hooks/apple.json';

interface ILine {
  type: 'buy' | 'sell';
  timestamp: string;
}



export default function Home() {
  const [range, setRange] = useState(14);
  const [minThreshold, setMinThreshold] = useState(0.1);

  const lines: ILine[] = useMemo(() => {
    const lines: ILine[] = [];
    const closePrices = [...data].map((d) => new Number(d.close) as number);

    for (let i = 0; i < closePrices.length; i++) {
      const start = closePrices[i];

      let min = {
        value: start,
        index: i
      };

      let max = {
        value: start,
        index: i
      }

      let end = i + range;

      for (let j = i; j < end; j++) {
        const price = closePrices[j];

        if (price < min.value) {
          min = {
            value: price,
            index: j
          };
        }
        else if (price > max.value) {
          max = {
            value: price,
            index: j
          };
        }
      }

      const min_delta = (min.value - start);
      const max_delta = (max.value - start);

      if (min_delta < minThreshold && max_delta < minThreshold) {
        i += range;
        continue;
      }

      if (Math.abs(min_delta) > Math.abs(max_delta) && lines[lines.length - 1].type === 'sell') {
        lines.push({
          type: 'buy',
          timestamp: data[min.index].timestamp
        });
        i = min.index;
      } else {
        if (!lines[lines.length - 1] || lines[lines.length - 1] && lines[lines.length - 1].type === 'buy') {
          lines.push({
            type: 'sell',
            timestamp: data[max.index].timestamp
          });
          i = max.index;
        }
      }
    }

    return lines;
  }, [range, minThreshold])

  console.debug(lines.length)

  return (
    <>
      <main className="container pt-24 md:place-items-center">
        <h1 className="font-bold mb-4">Labeller</h1>
        <div className="flex justify-start relative max-w-5xl">
          <ResponsiveContainer width={'99%'} height={400}>
            <LineChart data={data}>
              <XAxis dataKey="timestamp" />
              <YAxis />
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="close" stroke="#82ca9d" dot={false} />
              <Legend />
              <Tooltip />
              {
                lines.map(({ type, timestamp }, index) => (
                  <ReferenceLine
                    key={index}
                    x={timestamp}
                    stroke={type === 'buy' ? '#82ca9d' : '#ff0000'}
                  />
                ))
              }
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>

      <div className="container space-y-2">
        <div className="flex">
          <input
            type="range"
            min="1"
            max="30"
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
          />
          <div className="ml-2">
            {range} range
          </div>
        </div>

        <div className="flex">
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            value={minThreshold}
            onChange={(e) => setMinThreshold(e.target.value as any as number)}
          />
          <div className="ml-2">
            {minThreshold} min threshold
          </div>

        </div>
      </div>


    </>
  );
}
