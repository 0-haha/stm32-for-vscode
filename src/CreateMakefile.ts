/* eslint-disable max-len */
/**
* MIT License
*
* Copyright (c) 2020 Bureau Moeilijke Dingen
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

/*
 * Set of functions for creating a makefile based on STM32
 * makefile info and the Src, Inc and Lib folders
 * Created by Jort Band - Bureau Moeilijke Dingen
*/

import 'process';

import { isEmpty, isString, uniq } from 'lodash';

import MakeInfo from './types/MakeInfo';
import { fsPathToPosix } from './Helpers';
import { makefileName, STM32_ENVIRONMENT_FILE_NAME } from './Definitions';

/**
 * @description formats an array of string into one string with line endings per array entry.
 * @param {string[]} arr
 */
export function createStringList(arr: string[], prefix?: string): string {
  let output = '';
  const sortedArray = uniq(arr).sort();
  sortedArray.map((entry: string, ind: number) => {
    // Replace '#' with '\#' (for escaping in Makefile).
    // Backslash replacement is because CodeQL complained about incomplete escaping.
    const escapedEntry = entry.replace(/\\/g, '\\\\').replace(/#/g, '\\#');
    
    if (prefix) {
      output += prefix;
    }
    output += escapedEntry;
    if (ind < sortedArray.length - 1) {
      output += ' \\';
    }
    output += '\n';
  });

  return output;
}

/**
 * @description formats an array of strings into one string with spaces between entries.
 * @param {string[]} arr
 */
export function createSingleLineStringList(arr: string[], prefix?: string): string {
  let output = '';
  const sortedArray = uniq(arr).sort();
  sortedArray.map((entry) => {
    if (prefix) {
      output += prefix;
    }
    output += `${entry} `;
  });
  return output;
}

export function createGCCPathOutput(makeInfo: MakeInfo): string {
  if (makeInfo.tools.armToolchainPath && isString(makeInfo.tools.armToolchainPath)) {
    if (makeInfo?.tools?.armToolchainPath && !isEmpty(makeInfo.tools.armToolchainPath) && makeInfo.tools.armToolchainPath !== '.') {
      return `GCC_PATH="${fsPathToPosix(makeInfo.tools.armToolchainPath)}`;
    }
  }
  return '';
}
/**
 * Gives a prefix to an input string and checks if it already exists. If the input is empty the prefix is not added.
 */
function createPrefixWhenNoneExists(input: string, prefix: string): string {
  if (!input || input.length === 0) {
    return '';
  }
  if (input.indexOf(prefix) >= 0) {
    return input;
  }
  return `${prefix}${input}`;
}

/**
 * Create a string with compatible makefile rules.
 * @param makeInfo makeInfo
 * @returns a string containing custom makefile rules which can be embedded in the makefile
 */
function customMakefileRules(makeInfo: MakeInfo): string {

  if (makeInfo.customMakefileRules) {
    // reduces the makefile rules and returns them
    return makeInfo.customMakefileRules.reduce(
      (previousString, currentValue) => {
        const { command, rule, dependsOn = '' } = currentValue;
        const newRule =
          `
#######################################
# ${command}
#######################################
${command}: ${dependsOn}
\t${rule}
      `;
        return `${previousString}\n\n${newRule}`;
      }, '');

  }
  // returns empty when no customMakefileRules are found
  return '';
}

export default function createMakefile(makeInfo: MakeInfo): string {
  // NOTE: check for the correct info needs to be given beforehand
  return `##########################################################################################################################
# File automatically-generated by STM32forVSCode
##########################################################################################################################

# ------------------------------------------------
# Generic Makefile (based on gcc)
#
# ChangeLog :
#   2024-04-27 - Added env file inclusion. 
#                Added way to overide: build directory, target name and optimisation.
#                Added GCC_PATH by env file to not make the makefile machine dependent.
#                Currently folder structure in build directory is preserved
#                Switching of debug/release build output folder now happens based on debug flag
#   2017-02-10 - Several enhancements + project update mode
#   2015-07-22 - first version
# ------------------------------------------------

######################################
# Environment Variables
######################################
# Imports the environment file in which the compiler and other tooling is set
# for the build machine.
# This can also be used to overwrite some makefile variables
file_exists = $(or $(and $(wildcard $(1)),1),0)
ifeq ($(call file_exists,${STM32_ENVIRONMENT_FILE_NAME}),1)
  include ${STM32_ENVIRONMENT_FILE_NAME}
endif

######################################
# Target
######################################
# This is the name of the embedded target which will be build
# The final file name will also have debug or release appended to it.
TARGET ?= ${makeInfo.target}

#######################################
# Build directories
#######################################
# Build path can be overwritten when calling make or setting the environment variable
# in ${STM32_ENVIRONMENT_FILE_NAME}

BUILD_DIRECTORY ?= build


######################################
# Optimization
######################################
# Optimization is switched based upon the DEBUG variable. If set to 1
# it will be build in debug mode with the Og optimization flag (optimized for debugging).
# If set to 0 (false) then by default the variable is used in the configuration yaml
# This can also be overwritten using the environment variable or by overwriting it
# by calling make with the OPTIMIZATION variable e.g.:
# make -f ${makefileName} -j 16  OPTIMIZATION=Os

# variable which determines if it is a debug build
DEBUG ?= 1

# debug flags when debug is defined
OPTIMIZATION ?= ${createPrefixWhenNoneExists(makeInfo.optimization, '-')}

RELEASE_DIRECTORY = $(BUILD_DIRECTORY)/debug
ifeq ($(DEBUG),1)
  # Sets debugging optimization -Og and the debug information output
  OPTIMIZATION_FLAGS += -Og -g -gdwarf -ggdb
  $(TARGET) := $(TARGET)-debug
  RELEASE_DIRECTORY := $(BUILD_DIRECTORY)/debug
else
  OPTIMIZATION_FLAGS += $(OPTIMIZATION)
  $(TARGET) := $(TARGET)-release
  RELEASE_DIRECTORY := $(BUILD_DIRECTORY)/release
endif

######################################
# source
######################################
# C sources
C_SOURCES =  ${'\\'}
${createStringList(makeInfo.cSources)}

CPP_SOURCES = ${'\\'}
${createStringList(makeInfo.cxxSources)}

# ASM sources
ASM_SOURCES =  ${'\\'}
${createStringList(makeInfo.asmSources)}

#######################################
# Tools
#######################################
ARM_PREFIX = arm-none-eabi-
POSTFIX = "
PREFIX = "
# The gcc compiler bin path can be defined in the make command via ARM_GCC_PATH variable (e.g.: make ARM_GCC_PATH=xxx)
# or it can be added to the PATH environment variable.
# By default the variable be used from the environment file: ${STM32_ENVIRONMENT_FILE_NAME}.
# if it is not defined

ifdef ARM_GCC_PATH
    CC = $(PREFIX)$(ARM_GCC_PATH)/$(ARM_PREFIX)gcc$(POSTFIX)
    CXX = $(PREFIX)$(ARM_GCC_PATH)/$(ARM_PREFIX)g++$(POSTFIX)
    AS = $(PREFIX)$(ARM_GCC_PATH)/$(ARM_PREFIX)gcc$(POSTFIX) -x assembler-with-cpp
    CP = $(PREFIX)$(ARM_GCC_PATH)/$(ARM_PREFIX)objcopy$(POSTFIX)
    SZ = $(PREFIX)$(ARM_GCC_PATH)/$(ARM_PREFIX)size$(POSTFIX)
    DP = $(PREFIX)$(ARM_GCC_PATH)/$(ARM_PREFIX)objdump$(POSTFIX)
else
  CC ?= $(ARM_PREFIX)gcc
  CXX ?= $(ARM_PREFIX)g++$
  AS ?= $(ARM_PREFIX)gcc -x assembler-with-cpp
  CP ?= $(ARM_PREFIX)objcopy
  SZ ?= $(ARM_PREFIX)size
  DP ?= $(ARM_PREFIX)objdump
endif

HEX = $(CP) -O ihex
BIN = $(CP) -O binary -S
LSS = $(DP) -h -S

# Flash and debug tools
# Default is openocd however will be gotten from the env file when existing
OPENOCD ?= openocd


#######################################
# CFLAGS
#######################################
# cpu
CPU = ${createPrefixWhenNoneExists(makeInfo.cpu, '-mcpu=')}

# fpu
FPU = ${createPrefixWhenNoneExists(makeInfo.fpu, '-mfpu=')}

# float-abi
FLOAT-ABI = ${createPrefixWhenNoneExists(makeInfo.floatAbi, '-mfloat-abi=')}

# mcu
MCU = $(CPU) -mthumb $(FPU) $(FLOAT-ABI)

# macros for gcc
# AS defines
AS_DEFS = \
${createStringList(makeInfo.asDefs, '-D')}

# C defines
C_DEFS =  ${'\\'}
${createStringList(makeInfo.cDefs, '-D')}

# CXX defines
CXX_DEFS =  ${'\\'}
${createStringList(makeInfo.cxxDefs, '-D')}

# AS includes
AS_INCLUDES = ${'\\'}

# C includes
C_INCLUDES =  ${'\\'}
${createStringList(makeInfo.cIncludes, '-I')}


# compile gcc flags
ASFLAGS = $(MCU) $(AS_DEFS) $(AS_INCLUDES) $(C_INCLUDES) $(C_DEFS) $(OPTIMIZATION_FLAGS) 

CFLAGS = $(MCU) $(C_DEFS) $(C_INCLUDES) $(OPTIMIZATION_FLAGS)

CXXFLAGS = $(MCU) $(CXX_DEFS) $(C_INCLUDES) $(OPTIMIZATION_FLAGS)

# Add additional flags
CFLAGS += ${createSingleLineStringList(makeInfo.cFlags)}
ASFLAGS += ${createSingleLineStringList(makeInfo.assemblyFlags)}
CXXFLAGS += ${createSingleLineStringList(makeInfo.cxxFlags)}

# Generate dependency information
CFLAGS += -MMD -MP -MF"$(@:%.o=%.d)"
CXXFLAGS += -MMD -MP -MF"$(@:%.o=%.d)"

# Output a list file for the compiled source file.
# This is a representative of the source code in assembly
ASSEMBLER_LIST_OUTPUT_FLAG = -Wa,-a,-ad,-alms=$(call add_release_directory,$<,lst)
CFLAGS += $(ASSEMBLER_LIST_OUTPUT_FLAG)
CXXFLAGS += $(ASSEMBLER_LIST_OUTPUT_FLAG)

#######################################
# LDFLAGS
#######################################
# link script
LDSCRIPT = ${makeInfo.ldscript}

# libraries
LIBS = ${createSingleLineStringList(makeInfo.libs, '-l')}
LIBDIR = ${'\\'}
${createStringList(makeInfo.libdir, '-L')}

# Additional LD Flags from config file
ADDITIONALLDFLAGS = ${createSingleLineStringList(makeInfo.ldFlags)}

LDFLAGS = $(MCU) $(ADDITIONALLDFLAGS) -T$(LDSCRIPT) $(LIBDIR) $(LIBS) -Wl,-Map=$(BUILD_DIRECTORY)/$(TARGET).map,--cref -Wl,--gc-sections

#######################################
# build the application
#######################################
add_release_directory = $(sort $(addprefix $(RELEASE_DIRECTORY)/,$(addsuffix .$(2),$(basename $(subst ../,parent,$(1))))))

REMOVE_DIRECTORY_COMMAND = rm -fR
mkdir_function = mkdir -p $(1)
ifeq ($(OS),Windows_NT)
  convert_to_windows_path = $(strip $(subst /,\\,$(patsubst %/,%,$(1))))
  REMOVE_DIRECTORY_COMMAND = cmd /c rd /s /q
  mkdir_function = cmd /e:on /c md $(call convert_to_windows_path,$(1))
endif



OBJECTS = $(call add_release_directory,$(C_SOURCES),o)
OBJECTS += $(call add_release_directory,$(CPP_SOURCES),o)
OBJECTS += $(call add_release_directory,$(ASM_SOURCES),o)
vpath %.c $(sort $(dir $(C_SOURCES)))
vpath %.cc $(sort $(dir $(CXX_SOURCES)))
vpath %.cp $(sort $(dir $(CXX_SOURCES)))
vpath %.cxx $(sort $(dir $(CXX_SOURCES)))
vpath %.cpp $(sort $(dir $(CXX_SOURCES)))
vpath %.c++ $(sort $(dir $(CXX_SOURCES)))
vpath %.C $(sort $(dir $(CXX_SOURCES)))
vpath %.CPP $(sort $(dir $(CXX_SOURCES)))
vpath %.s $(sort $(dir $(ASM_SOURCES)))
vpath %.S $(sort $(dir $(ASM_SOURCES)))

# the tree of folders which needs to be present based on the object files
BUILD_TREE = $(sort $(patsubst %/,%,$(dir $(OBJECTS))))

# C build
$(RELEASE_DIRECTORY)/%.o: %.c ${makefileName} | $(BUILD_TREE)
\t$(CC) -c $(CFLAGS) $< -o $@

# C++ build 
$(RELEASE_DIRECTORY)/%.o: %.cc ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.cp ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.cxx ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.cpp ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.c++ ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.C ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.CPP ${makefileName} | $(BUILD_TREE)
\t$(CXX) -c $(CXXFLAGS) $< -o $@

#Assembly build
$(RELEASE_DIRECTORY)/%.o: %.s ${makefileName} | $(BUILD_TREE)
\t$(AS) -c $(ASFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.S ${makefileName} | $(BUILD_TREE)
\t$(AS) -c $(ASFLAGS) $< -o $@

$(RELEASE_DIRECTORY)/%.o: %.sx ${makefileName} | $(BUILD_TREE)
\t$(AS) -c $(ASFLAGS) $< -o $@

$(BUILD_DIRECTORY)/$(TARGET).elf: $(OBJECTS) ${makefileName} | $(BUILD_DIRECTORY)
\t$(${makeInfo.language === 'C' ? 'CC' : 'CXX'}) $(OBJECTS) $(LDFLAGS) -o $@
\t$(SZ) $@

$(BUILD_DIRECTORY)/%.hex: $(BUILD_DIRECTORY)/%.elf | $(BUILD_DIRECTORY)
\t$(HEX) $< $@

$(BUILD_DIRECTORY)/%.bin: $(BUILD_DIRECTORY)/%.elf | $(BUILD_DIRECTORY)
\t$(BIN) $< $@

$(BUILD_DIRECTORY)/%.lss: $(BUILD_DIRECTORY)/%.elf | $(BUILD_DIRECTORY)
\t$(LSS) $< > $@

$(BUILD_DIRECTORY):
\t$(call mkdir_function, $@)

$(BUILD_TREE):
\t$(call mkdir_function, $@)

#######################################
# all
#######################################
# default action: build all
all: $(BUILD_DIRECTORY)/$(TARGET).elf $(BUILD_DIRECTORY)/$(TARGET).hex $(BUILD_DIRECTORY)/$(TARGET).bin $(BUILD_DIRECTORY)/$(TARGET).lss 


flash: $(BUILD_DIRECTORY)/$(TARGET).elf
\t"$(OPENOCD)" -f ./openocd.cfg -c "program $(BUILD_DIRECTORY)/$(TARGET).elf verify reset exit"

#######################################
# erase
#######################################
erase: $(BUILD_DIRECTORY)/$(TARGET).elf
\t"$(OPENOCD)" -f ./openocd.cfg -c "init; reset halt; ${makeInfo.targetMCU} mass_erase 0; exit"

#######################################
# clean up
#######################################
clean:
\t$(REMOVE_DIRECTORY_COMMAND) $(BUILD_DIRECTORY)

#######################################
# custom makefile rules
#######################################
${customMakefileRules(makeInfo)}
	
#######################################
# dependencies
#######################################
-include $(wildcard $(BUILD_DIRECTORY)/*.d)

# *** EOF ***`;
}
