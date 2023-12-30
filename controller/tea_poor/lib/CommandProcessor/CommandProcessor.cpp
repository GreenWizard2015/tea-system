#include "CommandProcessor.h"
#include <cstring>
#include <sstream>

bool isValidIntNumber(const char *str, const int maxValue, const int minValue=0) {
  const int len = strlen(str);
  if (len < 1) return false;
  // check that string contains only digits
  // first character can be '-' for negative numbers
  if ((str[0] != '-') && !isdigit(str[0])) return false;
  for (int i = 1; i < len; i++) {
    if (!isdigit(str[i])) return false;
  }
  // check that number is in range
  const int value = atoi(str);
  if (value < minValue) return false;
  if (maxValue <= value) return false;
  return true;
}

std::string CommandProcessor::status() {
  std::stringstream response;
  response << "{";
  // send water threshold
  response << "\"water threshold\": " << _waterPumpSafeThreshold << ", ";
  // send water pump status
  const auto waterPumpStatus = _waterPump->status();
  const auto now = _env->time();
  const auto timeLeft = waterPumpStatus.isRunning ? waterPumpStatus.stopTime - now : 0;
  response 
    << "\"pump\": {"
    << "  \"running\": " << (waterPumpStatus.isRunning ? "true, " : "false, ")
    << "  \"time left\": " << timeLeft
    << "}";
  // end of water pump status
  ///////////////////////////////////
  // send remote control status
  // response << "\"remote control\": " << remoteControl.asJSONString();
  // end of JSON
  response << "}";

  return response.str();
}

std::string CommandProcessor::pour_tea(const char *milliseconds) {
  if (!isValidIntNumber(milliseconds, _waterPumpSafeThreshold)) {
    // send error message as JSON
    return std::string("{ \"error\": \"invalid milliseconds value\" }");
  }
  // start pouring tea
  _waterPump->start( atoi(milliseconds), _env->time() );
  return status();
}

std::string CommandProcessor::stop() {
  _waterPump->stop();
  return status();
}