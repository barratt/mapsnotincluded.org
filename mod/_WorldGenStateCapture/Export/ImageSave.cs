using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.IO;
using rail;

// To ensure flexibility, do not directly use any functions from Oxygen Not Included
namespace MapsNotIncluded_WorldParser.Export
{
	class ImageSave
	{
		public static unsafe void Save2dUint8ArrayAsPNG(string filePath, int width, int height, ushort* array)
		{
			using (Bitmap bitmap = new Bitmap(width, height, PixelFormat.Format8bppIndexed))
			{
				// Set grayscale palette (Required for Format8bppIndexed)
				ColorPalette palette = bitmap.Palette;
				for (int i = 0; i < 256; i++)
				{
					palette.Entries[i] = Color.FromArgb(i, i, i);
				}
				bitmap.Palette = palette;

				BitmapData data = bitmap.LockBits(
					new Rectangle(0, 0, width, height),
					ImageLockMode.WriteOnly,
					PixelFormat.Format8bppIndexed);

				byte* dst = (byte*)data.Scan0;
				int stride = data.Stride; // May be larger than width
				ushort* src = array;

				for (int y = 0; y < height; y++)
				{
					for (int x = 0; x < width; x++)
					{
						dst[y * stride + x] = (byte)(src[y * width + x] & 0xFF); // Convert ushort -> byte
					}
				}

				bitmap.UnlockBits(data);

				try
				{
					bitmap.Save(filePath, ImageFormat.Png);
				}
				catch (Exception ex)
				{
					Debug.LogError($"Error saving file: {ex.Message}");
				}
			}
		}
		public static unsafe void Save2dFloat32ArrayAsPNG8(string filePath, int width, int height, float* array, List<System.Tuple<double, double, double>> bins, double offset)
		{
			using (Bitmap bitmap = new Bitmap(width, height, PixelFormat.Format8bppIndexed))
			{
				// Set grayscale palette (Required for Format8bppIndexed)
				ColorPalette palette = bitmap.Palette;
				for (int i = 0; i < 256; i++)
				{
					palette.Entries[i] = Color.FromArgb(i, i, i);
				}
				bitmap.Palette = palette;

				BitmapData data = bitmap.LockBits(
					new Rectangle(0, 0, width, height),
					ImageLockMode.WriteOnly,
					PixelFormat.Format8bppIndexed);

				byte* dst = (byte*)data.Scan0;
				int stride = data.Stride; // May be larger than width
				float* src = array;

				for (int y = 0; y < height; y++)
				{
					for (int x = 0; x < width; x++)
					{
						float rawValue = array[y * width + x];
						float adjustedValue = rawValue + (float)offset;
						byte binIndex = (byte)GetBinIndex(adjustedValue, bins);
						dst[y * stride + x] = binIndex;
					}
				}

				bitmap.UnlockBits(data);

				try
				{
					bitmap.Save(filePath, ImageFormat.Png);
				}
				catch (Exception ex)
				{
					Debug.LogError($"Error saving file: {ex.Message}");
				}
			}
		}

		private static int GetBinIndex(double value, List<System.Tuple<double, double, double>> bins)
		{
			int binIndex = 0;

			foreach (var bin in bins)
			{
				double lower = bin.Item1;
				double upper = bin.Item2;
				double step = bin.Item3;

				if (value >= lower && value < upper)
				{
					// Find the nearest bin value by rounding to the nearest step
					double roundedValue = Math.Round((value - lower) / step) * step + lower;

					// Compute the bin index
					return binIndex + (int)Math.Round((roundedValue - lower) / step);
				}

				// Increment the bin index by the number of bins in this range
				binIndex += (int)Math.Round((upper - lower) / step);
			}
			// If out of range, return 0 if below lowest bin, or max index if above highest bin
			return value < bins[0].Item1 ? 0 : binIndex;
			/*
            int binCount = 0;

            foreach (var (lower, upper, binSize) in bins)
            {
                if (value >= lower && value < upper)
                {
                    int binIndex = (int)Math.Round((value - lower) / binSize);
                    return binCount + binIndex;
                }
                else
                {
                    binCount += (int)Math.Round((upper - lower) / binSize);
                }
            }

            return binCount; // Assigns out-of-range values to the highest bin*/
		}

		private static unsafe void FloatAsConsecUint8(byte* dst, int stride, float* array, int width, int height, int x, int y)
		{
			float value = array[y * width + x];
			byte* pixel = &dst[y * stride + x * 4];

			byte* bytes = (byte*)&value;
			pixel[0] = bytes[0]; // B
			pixel[1] = bytes[1]; // G
			pixel[2] = bytes[2]; // R
			pixel[3] = bytes[3]; // A (preserves float data)
		}

		public static unsafe void FloatAsSignedRGBA(byte* dst, int stride, float* array, int width, int height, int x, int y)
		{
			/*
            Float     | IEEE 754 (Hex) | R  | G  | B  | A  
            ------------------------------------------------
            0.000000  | 0x00000000   |   0 |   0 |   0 |   0
            0.500000  | 0x3F000000   |   0 |   0 |   0 | 126
            1.000000  | 0x3F800000   |   0 |   0 |   0 | 127
            2.000000  | 0x40000000   |   0 |   0 |   0 | 128
            5.000000  | 0x40A00000   |   0 |  64 |   0 | 129
            10.000000 | 0x41200000   |   0 |  64 |   0 | 130
            20.000000 | 0x41A00000   |   0 |  64 |   0 | 131
            50.000000 | 0x42480000   |   0 | 144 |   0 | 132
            100.000000 | 0x42C80000   |   0 | 144 |   0 | 133
            200.000000 | 0x43480000   |   0 | 144 |   0 | 134
            500.000000 | 0x43FA0000   |   0 | 244 |   0 | 135
            1000.000000 | 0x447A0000   |   0 | 244 |   0 | 136
            2000.000000 | 0x44FA0000   |   0 | 244 |   0 | 137
            5000.000000 | 0x459C4000   |   0 |  56 | 128 | 139
            10000.000000 | 0x461C4000   |   0 |  56 | 128 | 140
            20000.000000 | 0x469C4000   |   0 |  56 | 128 | 141
            50000.000000 | 0x47435000   |   0 | 134 | 160 | 142
            2.000000  | 0x3FFFFFFF   | 127 | 255 | 255 | 127
            2.000000  | 0x40000000   |   0 |   0 |   0 | 128
            2.000000  | 0x40000001   |   1 |   0 |   0 | 128
            */
			float value = array[y * width + x];

			// Interpret float as 32-bit integer to extract sign, exponent, and fraction
			uint bits = *(uint*)&value;

			byte signBit = (byte)(bits >> 31 & 0x1);      // 1-bit sign (0 for +, 1 for -)
			byte exponent = (byte)(bits >> 23 & 0xFF);    // 8-bit exponent
			uint fraction = bits & 0x7FFFFF;                // 23-bit mantissa

			// Extract mantissa bits for distribution
			byte green = (byte)(fraction >> 15 & 0xFF);   // Most significant 8 bits of mantissa
			byte blue = (byte)(fraction >> 7 & 0xFF);     // Next 8 bits of mantissa
			byte red = (byte)(fraction & 0x7F | signBit << 7); // Remaining 7 bits + sign in MSB

			// Get pointer to pixel location
			byte* pixel = &dst[y * stride + x * 4];

			// Assign pixel values (BGRA format)
			pixel[0] = blue;   // B (Next 8 bits of mantissa)
			pixel[1] = green;  // G (Most significant 8 bits of mantissa)
			pixel[2] = red;    // R (Sign bit in MSB + lowest 7 mantissa bits)
			pixel[3] = exponent; // A (Exponent)
		}


		private static unsafe void FloatAsDistributedRGBA(byte* dst, int stride, float* array, int width, int height, int x, int y)
		{
			float value = array[y * width + x];

			// Interpret float as 32-bit integer to extract sign, exponent, and fraction
			uint bits = *(uint*)&value;

			byte sign = (byte)(bits >> 31 == 0 ? 255 : 127);  // 1-bit sign (A channel)
			byte exponent = (byte)(bits >> 23 & 0xFF);        // 8-bit exponent
			uint fraction = bits & 0x7FFFFF;                    // 23-bit fraction

			// Distribute the fraction evenly across B, G, R channels
			byte blue = (byte)(exponent | fraction >> 16 & 0xFF);
			byte green = (byte)(exponent | fraction >> 8 & 0xFF);
			byte red = (byte)(exponent | fraction & 0xFF);

			// Get pointer to pixel location
			byte* pixel = &dst[y * stride + x * 4];

			// Assign pixel values (BGRA format)
			pixel[0] = blue;   // B
			pixel[1] = green;  // G
			pixel[2] = red;    // R
			pixel[3] = sign;   // A (Sign bit: 255 for positive, 127 for negative)
		}

		public static unsafe void TestFloatToRGBA()
		{
			float[] testValues =
			{
				0, 0.5f, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000,
				2000, 5000, 10000, 20000, 50000,
				1.9999999f, // Just before 2.0
                2.0f, // Exactly 2.0
                2.0000002f  // Just after 2.0
            };

			Debug.Log("Float     | IEEE 754 (Hex) | R  | G  | B  | A  ");
			Debug.Log("------------------------------------------------");

			// Allocate temporary buffer for one pixel
			byte[] buffer = new byte[4];
			fixed (byte* dst = buffer)
			{
				foreach (float value in testValues)
				{
					// Convert float to raw IEEE 754 bits
					uint bits = *(uint*)&value;

					// Call the function (processes one value as if it's a 1x1 image)
					float[] array = new float[] { value };
					fixed (float* ptr = array)
					{
						FloatAsSignedRGBA(dst, 4, ptr, 1, 1, 0, 0); // change as needed!
					}

					// Extract resulting BGRA values
					byte blue = buffer[0];
					byte green = buffer[1];
					byte red = buffer[2];
					byte alpha = buffer[3];

					// Print results in a structured table
					Debug.Log($"{value,-9:F6} | 0x{bits:X8}   | {red,3} | {green,3} | {blue,3} | {alpha,3}");
				}
			}
		}



		public static unsafe void Save2dFloat32ArrayAsPNG32(string filePath, int width, int height, float* array)
		{
			TestFloatToRGBA();
			using (Bitmap bitmap = new Bitmap(width, height, PixelFormat.Format32bppArgb))
			{
				BitmapData data = bitmap.LockBits(
					new Rectangle(0, 0, width, height),
					ImageLockMode.WriteOnly,
					PixelFormat.Format32bppArgb);

				byte* dst = (byte*)data.Scan0;
				int stride = data.Stride;

				for (int y = 0; y < height; y++)
				{
					for (int x = 0; x < width; x++)
					{
						FloatAsConsecUint8(dst, stride, array, width, height, x, y);
					}
				}

				bitmap.UnlockBits(data);

				try
				{
					bitmap.Save(filePath, ImageFormat.Png);
				}
				catch (Exception ex)
				{
					Debug.LogError($"Error saving file: {ex.Message}");
				}
			}
		}
	}
}
