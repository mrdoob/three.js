import { regexp as r } from "./ifc-regexp.js";

const IdReader = {
  filter: r.expressId,
  read: (ifcLine) => {
    return parseInt(ifcLine.match(r.expressId).toString().slice(1));
  },
};

const IdSetReader = {
  filter: r.expressIdSet,
  read: (ifcLine) => {
    return ifcLine
      .match(r.expressIdSet)[0]
      .toString()
      .slice(1, -1)
      .split(",")
      .map((e) => {
        e = e.replace(r.boundingSpaces, "");
        return parseInt(e.slice(1));
      });
  },
};

const GuidReader = {
  filter: r.guid,
  read: (ifcLine) => {
    return ifcLine.match(r.guid).toString().slice(1, -1);
  },
};

const TextReader = {
  filter: r.text,
  read: (ifcLine) => {
    return ifcLine.match(r.text).toString().replace(r.boundingApostrophes, "");
  },
};

const EnumReader = {
  filter: r.enum,
  read: (ifcLine) => {
    return ifcLine.match(r.enum).toString().replace(r.boundingPoints, "");
  },
};

const NumberReader = {
  filter: r.Number,
  read: (ifcLine) => {
    return Number(ifcLine.match(r.Number).toString());
  },
};

const IfcValueReader = {
  filter: r.ifcValue,
  read: (ifcLine) => {
    return ifcLine.match(r.ifcValue)[0].toString();
  },
};

const numberSetReader = {
  filter: r.numberSet,
  read: (ifcLine) => {
    return ifcLine
      .match(r.numberSet)
      .toString()
      .replace(r.boundingBrackets, "")
      .split(",")
      .map((e) => {
        return Number(e);
      });
  },
};

const defaultValueReader = {
  filter: r.default,
  read: (ifcLine) => {
    return ifcLine.match(r.default).toString();
  },
};

const asteriskReader = {
  filter: r.asterisk,
  read: (ifcLine) => {
    return ifcLine.match(r.asterisk).toString();
  },
};

const emptySetReader = {
  filter: r.emptySet,
  read: (ifcLine) => {
    return ifcLine.match(r.emptySet).toString();
  },
};

export {
  IdReader,
  IdSetReader,
  GuidReader,
  TextReader,
  NumberReader,
  IfcValueReader,
  defaultValueReader,
  asteriskReader,
  emptySetReader,
  EnumReader,
  numberSetReader,
};
