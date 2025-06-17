/*
  Oxygen Not Included Seed Browser Frontend
  Copyright (C) 2025 The Maps Not Included Authors
  
  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.
  
  You should have received a copy of the GNU Affero General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
  
  See the AUTHORS file in the project root for a full list of contributors.
*/

// TODO: make the base error explicitly set or not set
// TODO: cascading warning/info/log
export function createError(locationName: string, msg: string, doConsoleLog: Boolean = false, baseError?: unknown): Error {
    const prefixedMsg = `[${locationName}] ❌ ${msg}`;
    const errorOptions = baseError ? {cause: baseError} : undefined;
    if (doConsoleLog) {
        console.error(prefixedMsg, baseError);
    }
    return new Error(prefixedMsg, errorOptions);
}